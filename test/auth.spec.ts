import { it, expect, describe } from "vitest"
import express from "express"
import { tepper } from "./utils/tepperWrapper.js"

describe("auth", () => {
  it("sends configured jwt", async () => {
    const app = express().post("/", (req, res) => {
      res.send(req.headers.authorization)
    })

    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

    const { text } = await tepper(app).post("/").authWith(jwt).run()

    expect(text).toEqual(`Bearer ${jwt}`)
  })
})
