import express from "express"
import tepper from "../src/tepper"

describe("utils", () => {
  it("is capable to debug requests", async () => {
    jest.spyOn(console, "dir").mockImplementation(jest.fn())
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
