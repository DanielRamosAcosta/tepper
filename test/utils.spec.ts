import { it, expect, describe, vi } from "vitest"
import express from "express"
import tepper from "../src/tepper"
import { noop } from "./utils/noop"

describe("utils", () => {
  it("is capable to debug requests", async () => {
    vi.spyOn(console, "dir").mockImplementation(noop)
    const app = express()
      .use(express.json())
      .post("/", (req, res) => {
        res.send(req.body)
      })

    await tepper(app).post("/").send([1, 2, 3]).debug().run()

    expect(console.dir).toHaveBeenCalledTimes(1)
    expect(console.dir).toHaveBeenCalledWith([1, 2, 3], { depth: Infinity })
  })
})
