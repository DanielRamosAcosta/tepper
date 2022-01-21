import express from "express"
import tepper from "../src/tepper"

describe("query params", () => {
  it("sends all the query params", async () => {
    const app = express().get("/", (req, res) => {
      res.send(req.query)
    })

    const { body } = await tepper(app)
      .get("")
      .withQuery({ hello: "world" })
      .run()

    expect(body).toEqual({ hello: "world" })
  })
})
