import { it, expect, describe } from "vitest"
import express from "express"
import tepper from "../src/tepper"

const httpVerbs = [["get"], ["post"], ["put"], ["patch"], ["delete"]] as const

describe("http verbs", () => {
  it.each(httpVerbs)("works with %s", async (verb) => {
    const app = express()

    app[verb]("/", (_req, res) => {
      res.send()
    })

    await tepper(app, { expect })[verb]("/").expect(200).run()
  })
})
