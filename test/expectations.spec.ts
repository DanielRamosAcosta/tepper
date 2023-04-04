import { it, expect, describe } from "vitest"
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

  it("supports typing the response", async () => {
    const app = express()
      .use(express.json())
      .get("/", (_req, res) => {
        res.json({ status: "ok" })
      })

    const { body } = await tepper(app)
      .get<{ status: string }>("/")
      .expect(200)
      .run()

    expect(body.status).toBe("ok")
  })

  it("has default error typing", async () => {
    const app = express()
      .use(express.json())
      .get("/", (_req, res) => {
        res.status(400).json({
          error: {
            code: "INVALID_EMAIL",
            message: "The provided email is invalid",
            status: 400,
          },
        })
      })

    const { body } = await tepper(app).get("/").run()

    expect(body.error.code).toBe("INVALID_EMAIL")
    expect(body.error.message).toBe("The provided email is invalid")
    expect(body.error.status).toBe(400)
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

  it("shows a descriptive message of the json diff", async () => {
    const expectToEqual = (actual: any, expected: any) => {}
    const app = express()
    app.get("/", (_req, res) => {
      res.json({ name: "alice" })
    })

    const promise = tepper(app).get("/").expect({ name: "bob" }).run()

    const error = await promise.catch((err) => err)
    await expect(error).instanceof(Error)
    expect(error.message).toMatchInlineSnapshot(`
      "Expected values to be strictly deep-equal:
      + actual - expected

        {
      +   name: 'alice'
      -   name: 'bob'
        }"
    `)
  })

  it("supports custom expectation function", async () => {
    const expectToEqual = (actual: any, expected: any) => {
      throw new Error("This is my custom error")
    }
    const app = express()
    app.get("/", (_req, res) => {
      res.json({ name: "alice" })
    })

    const promise = tepper(app, { expectToEqual })
      .get("/")
      .expect({ name: "bob" })
      .run()

    const error = await promise.catch((err) => err)
    await expect(error).instanceof(Error)
    expect(error.message).toEqual("This is my custom error")
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
