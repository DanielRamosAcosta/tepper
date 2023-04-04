import { it, expect, describe } from "vitest"
import express from "express"
import tepper from "../src/tepper"

describe("headers", () => {
  it("supports sending custom headers", async () => {
    const CUSTOM_HEADER = "X-Custom-Header"
    const CUSTOM_HEADER_VALUE = "custom-header-value"
    const app = express().get("/", (req, res) => {
      res.send(req.headers[CUSTOM_HEADER.toLowerCase()])
    })

    const { text } = await tepper(app)
      .get("/")
      .withHeaders({
        [CUSTOM_HEADER]: CUSTOM_HEADER_VALUE,
      })
      .run()

    expect(text).toEqual(CUSTOM_HEADER_VALUE)
  })

  it("does not add headers if they are not provided", async () => {
    const CUSTOM_HEADER = "X-Custom-Header"
    const app = express().post("/", (req, res) => {
      res.send(req.headers[CUSTOM_HEADER.toLowerCase()])
    })

    const { text } = await tepper(app).post("/").send("foo").run()

    expect(text).toEqual("")
  })
})
