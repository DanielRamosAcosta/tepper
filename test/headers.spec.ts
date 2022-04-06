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
})
