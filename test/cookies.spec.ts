import { it, expect, describe } from "vitest"
import express from "express"
import tepper from "../src/tepper"
import cookieParser from "cookie-parser"

describe("headers", () => {
  it("supports sending custom cookies", async () => {
    const CUSTOM_COOKIE = "X-Custom-Cookie"
    const CUSTOM_COOKIE_VALUE = "custom-cookie-value"
    const app = express()
    app.use(cookieParser())

    app.get("/", (req, res) => {
      res.send(req.cookies)
    })

    const { body } = await tepper(app)
      .get("/")
      .withCookies({
        [CUSTOM_COOKIE]: CUSTOM_COOKIE_VALUE,
      })
      .run()

    expect(body).toEqual({ [CUSTOM_COOKIE]: CUSTOM_COOKIE_VALUE })
  })
})
