import { it, describe } from "vitest"
import express from "express"
import tepper from "../src/tepper"

describe("sending JSON", () => {
  it("should work with .send()", async () => {
    const app = express()
      .use(express.json())
      .post("/", (req, res) => {
        res.send(req.body.name)
      })

    await tepper(app).post("/").send({ name: "john" }).expect("john").run()
  })

  it("should work with .send() with an array", async () => {
    const app = express()
      .use(express.json())
      .post("/", (req, res) => {
        res.send(req.body)
      })

    await tepper(app).post("/").send([1, 2, 3]).expect([1, 2, 3]).run()
  })
})
