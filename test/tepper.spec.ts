import http, { Server } from "http"
import express from "express"
import tepper from "../src/tepper"
import { closePromised } from "../src/utils/closePromised"
import { listenAppPromised } from "../src/utils/listenPromised"

describe("tepper", () => {
  it("fires up the app on an ephemeral port", async () => {
    const app = express()

    app.get("/", (_req, res) => {
      res.send("hey")
    })

    const { text, status } = await tepper(app).get("/").run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")
  })

  it("fires up the app on an ephemeral port with custom path", async () => {
    const app = express()

    app.get("/hello", (_req, res) => {
      res.send("hey")
    })

    const { text, status } = await tepper(app).get("/hello").run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")
  })

  it("works with an active server", async () => {
    const app = express()

    app.get("/", (_req, res) => {
      res.send("hey")
    })

    const server = await listenAppPromised(app, 4000, "127.0.0.1")

    const { text, status } = await tepper(server).get("/").run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await expectServerToBeClosed(server)
  })

  it("works with an active server and custom path", async () => {
    const app = express()

    app.get("/hello", (_req, res) => {
      res.send("hey")
    })

    const server = await listenAppPromised(app, 4000, "127.0.0.1")

    const { text, status } = await tepper(server).get("/hello").run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await expectServerToBeClosed(server)
  })

  it("works with a server that is not listening", async () => {
    const app = express()

    app.get("/", (_req, res) => {
      res.send("hey")
    })

    const server = http.createServer(app)

    const { text, status } = await tepper(server).get("/").run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await expectServerToBeClosed(server)
  })

  it("should work with remote server", async () => {
    const app = express()

    app.get("/", (_req, res) => {
      res.send("hey")
    })

    const server = await listenAppPromised(app, 4001, "127.0.0.1")

    const { text, status } = await tepper(`http://localhost:4001`)
      .get("/")
      .run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await closePromised(server)
  })

  it("should work with remote server and custom path", async () => {
    const app = express()

    app.get("/hello", (_req, res) => {
      res.send("hey")
    })

    const server = await listenAppPromised(app, 4001, "127.0.0.1")

    const { text, status } = await tepper(`http://localhost:4001`)
      .get("/hello")
      .run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await closePromised(server)
  })

  it("should work with .send()", async () => {
    const app = express()

    app.use(express.json())

    app.post("/", (req, res) => {
      res.send(req.body.name)
    })

    await tepper(app).post("/").send({ name: "john" }).expect("john").run()
  })

  it("should work with .send() with an array", async () => {
    const app = express()

    app.use(express.json())

    app.post("/", (req, res) => {
      res.send(req.body)
    })

    await tepper(app).post("/").send([1, 2, 3]).expect([1, 2, 3]).run()
  })

  it("should work when unbuffered", async () => {
    const app = express()

    app.get("/", (_req, res) => {
      res.end("Hello")
    })

    await tepper(app).get("/").expect("Hello").run()
  })

  it("should default redirects to 0", async () => {
    const app = express()

    app.get("/", (_req, res) => {
      res.redirect("/login")
    })

    await tepper(app).get("/").expect(302).run()
  })

  it("should handle redirects", async () => {
    const app = express()

    app.get("/login", (_req, res) => {
      res.end("Login")
    })

    app.get("/", (_req, res) => {
      res.redirect("/login")
    })

    const { text, status } = await tepper(app).get("/").redirects(1).run()

    expect(status).toEqual(200)
    expect(text).toEqual("Login")
  })

  it("should handle socket errors", async () => {
    const app = express()

    app.get("/", (_req, res) => {
      res.destroy()
    })

    const error = await tepper(app)
      .get("/")
      .run()
      .catch((error) => error)

    expect(error.message).toMatch(
      new RegExp(
        "request to http://127.0.0.1:(\\d+)/ failed, reason: socket hang up",
      ),
    )
  })

  it("should handle an undefined Response", async () => {
    const app = express()

    app.get("/", (_req, res) => {
      setTimeout(() => {
        res.end()
      }, 20)
    })

    const error = await tepper(app)
      .get("/")
      .timeout(1)
      .run()
      .catch((error) => error)

    expect(error.message).toMatch(
      new RegExp("network timeout at: http://127.0.0.1:(\\d+)/"),
    )
  })

  it("sends configured jwt", async () => {
    const app = express()

    app.get("/", (req, res) => {
      res.send(req.headers.authorization)
    })

    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

    const { text } = await tepper(app).authWith(jwt).get("/").run()

    expect(text).toEqual(`Bearer ${jwt}`)
  })

  it("sends all the query params", async () => {
    const app = express()

    app.get("/", (req, res) => {
      res.send(req.query)
    })

    const { body } = await tepper(app)
      .get("")
      .withQuery({ hello: "world" })
      .run()

    expect(body).toEqual({ hello: "world" })
  })

  describe("expectations", () => {
    it("fails if it's not the expected body", async () => {
      const app = express()

      app.use(express.json())

      app.get("/", (_req, res) => {
        res.send("alice")
      })

      const promise = tepper(app).get("/").expect("bob").run()

      await expect(promise).rejects.toBeDefined()
    })

    it("asserts with a json body when is ok", async () => {
      const app = express()

      app.use(express.json())

      app.get("/", (_req, res) => {
        res.json({ status: "ok" })
      })

      await tepper(app).get("/").expect({ status: "ok" }).run()
    })

    it("asserts with a json body when is wrong", async () => {
      const app = express()

      app.use(express.json())

      app.get("/", (_req, res) => {
        res.json({ status: "ko" })
      })

      const promise = tepper(app).get("/").expect({ status: "ok" }).run()

      await expect(promise).rejects.toBeDefined()
    })

    it("fails if it's not the expected status code", async () => {
      const app = express()

      app.use(express.json())

      app.get("/", (_req, res) => {
        res.send("alice")
      })

      const promise = tepper(app).get("/").expect(404).run()

      await expect(promise).rejects.toBeDefined()
    })
  })

  describe("http verbs", () => {
    it.each([["get"], ["post"], ["put"], ["patch"], ["delete"]] as const)(
      "works with %s",
      async (asd) => {
        const app = express()

        app[asd]("/", (_req, res) => {
          res.send()
        })

        await tepper(app)[asd]("/").expect(200).run()
      },
    )
  })

  it("throws an error if using the builder as a promise", async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await tepper("").expect(200)
    } catch (error) {
      expect(error.message).toEqual(
        "Do not place await in the builder, use .run() method",
      )
    }
  })

  it("should work with .send() with an array", async () => {
    jest.spyOn(console, "dir").mockImplementation(jest.fn())

    const app = express()

    app.use(express.json())

    app.post("/", (req, res) => {
      res.send(req.body)
    })

    await tepper(app).post("/").send([1, 2, 3]).debug().run()

    expect(console.dir).toHaveBeenCalledTimes(1)
  })
})

async function expectServerToBeClosed(server: Server) {
  const promise = closePromised(server).catch((error) =>
    Promise.reject(error.code),
  )

  await expect(promise).rejects.toEqual("ERR_SERVER_NOT_RUNNING")
}
