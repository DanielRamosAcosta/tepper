import { it, describe } from "vitest"
import express from "express"
import { tepper } from "./utils/tepperWrapper.js"

const httpVerbs = [["get"], ["post"], ["put"], ["patch"], ["delete"]] as const

describe("http verbs", () => {
  it.each(httpVerbs)("works with %s", async (verb) => {
    const app = express()

    app[verb]("/", (_req, res) => {
      res.send()
    })

    await tepper(app)[verb]("/").expect(200).run()
  })
})
