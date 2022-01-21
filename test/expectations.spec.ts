import express from "express"
import tepper from "../src/tepper"

describe("expectations", () => {
  it("fails if it's not the expected body", async () => {
    const app = express()
      .use(express.json())
      .get("/", (_req, res) => {
        res.send("alice")
      })

    const promise = tepper(app).get("/").expect("bob").run()

    await expect(promise).rejects.toBeDefined()
  })

  it("asserts with a json body when is ok", async () => {
    const app = express()
      .use(express.json())
      .get("/", (_req, res) => {
        res.json({ status: "ok" })
      })

    await tepper(app).get("/").expect({ status: "ok" }).run()
  })

  it("asserts with a json body when is wrong", async () => {
    const app = express()
      .use(express.json())
      .get("/", (_req, res) => {
        res.json({ status: "ko" })
      })

    const promise = tepper(app).get("/").expect({ status: "ok" }).run()

    await expect(promise).rejects.toBeDefined()
  })

  it("fails if it's not the expected status code", async () => {
    const app = express()
    app.get("/", (_req, res) => {
      res.send("alice")
    })

    const promise = tepper(app).get("/").expect(404).run()

    await expect(promise).rejects.toBeDefined()
  })
})
