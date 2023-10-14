import { it, expect, describe } from "vitest"
import express from "express"
import { tepper } from "./utils/tepperWrapper.js"

describe("edge cases", () => {
  it("should work when unbuffered", async () => {
    const app = express().get("/", (_req, res) => {
      res.end("Hello")
    })

    await tepper(app).get("/").expect("Hello").run()
  })

  it("should handle socket errors", async () => {
    const app = express().get("/", (_req, res) => {
      res.destroy()
    })

    const error = await tepper(app)
      .get("/")
      .run()
      .catch((error) => error)

    expect(error.message).toEqual("fetch failed")
  })

  it("should handle an undefined Response", async () => {
    const app = express().get("/", (_req, res) => {
      setTimeout(() => {
        res.end()
      }, 20)
    })

    const error = await tepper(app)
      .get("/")
      .timeout(1)
      .run()
      .catch((error) => error)

    expect(error.message).toEqual("The operation was aborted due to timeout")
  })

  it("throws an error if using the builder as a promise", async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await tepper("").expect(200)
    } catch (error: any) {
      expect(error.message).toEqual(
        "Do not place await in the builder, use .run() method",
      )
    }
  })
})
