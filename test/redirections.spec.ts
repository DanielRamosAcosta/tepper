import { it, expect, describe } from "vitest"
import express from "express"
import { tepper } from "./utils/tepperWrapper.js"

describe("redirections", () => {
  it("should default redirects to 0", async () => {
    const app = express().post("/login", (_req, res) => {
      res.redirect("/reset-password")
    })

    const { status } = await tepper(app).post("/login").run()

    expect(status).toEqual(302)
  })

  it("should handle redirects", async () => {
    const app = express()
      .post("/login", (_req, res) => {
        res.redirect("/reset-password")
      })
      .get("/reset-password", (_req, res) => {
        res.end("Login")
      })

    const { text, status } = await tepper(app).post("/login").redirects(1).run()

    expect(status).toEqual(200)
    expect(text).toEqual("Login")
  })
})
