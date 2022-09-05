import { it, expect, describe } from "vitest"
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

  it("skips undefined values", async () => {
    const app = express().get("/", (req, res) => {
      res.send(req.query)
    })

    const { body } = await tepper(app)
      .get("")
      .withQuery({ hello: undefined })
      .run()

    expect(body).toEqual({})
  })

  describe("array params", () => {
    it("parses correctly an array", async () => {
      const app = express().get("/", (req, res) => {
        res.send(req.query)
      })

      const { body } = await tepper(app)
        .get("")
        .withQuery({ tags: ["first-tag", "second-tag"] })
        .run()

      expect(body).toEqual({ tags: ["first-tag", "second-tag"] })
    })

    it("parses correctly an array with one element", async () => {
      const app = express().get("/", (req, res) => {
        res.send(req.query)
      })

      const { body } = await tepper(app)
        .get("")
        .withQuery({ tags: ["first-tag"] })
        .run()

      expect(body).toEqual({ tags: ["first-tag"] })
    })
  })
})
