import { it, expect, describe } from "vitest"
import express from "express"
import tepper from "../src/tepper"

describe("redirections", () => {
  it("should default redirects to 0", async () => {
    const app = express().get("/", (_req, res) => {
      res.redirect("/login")
    })

    const { status } = await tepper(app).get("/").run()

    expect(status).toEqual(302)
  })

  it("should handle redirects", async () => {
    const app = express()
      .get("/login", (_req, res) => {
        res.end("Login")
      })
      .get("/", (_req, res) => {
        res.redirect("/login")
      })

    const { text, status } = await tepper(app).get("/").redirects(1).run()

    expect(status).toEqual(200)
    expect(text).toEqual("Login")
  })
})
