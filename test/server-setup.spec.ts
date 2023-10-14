import { it, expect, describe } from "vitest"
import http from "http"
import express from "express"
import { tepper } from "./utils/tepperWrapper.js"
import { closePromised } from "../src/utils/closePromised"
import { listenAppPromised } from "../src/utils/listenPromised"
import { expectServerToBeClosed } from "./utils/expectServerToBeClosed"

describe("server setup", () => {
  it("fires up the app on an ephemeral port", async () => {
    const app = express().get("/hello", (_req, res) => {
      res.send("world")
    })

    const { text, status } = await tepper(app).get("/hello").run()

    expect(status).toEqual(200)
    expect(text).toEqual("world")
  })

  it("works with an active server", async () => {
    const app = express().get("/", (_req, res) => {
      res.send("hey")
    })
    const server = await listenAppPromised(app, 4000, "127.0.0.1")

    const { text, status } = await tepper(server).get("/").run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await expectServerToBeClosed(server)
  })

  it("works with an active server and custom path", async () => {
    const app = express().get("/hello", (_req, res) => {
      res.send("world")
    })
    const server = await listenAppPromised(app, 4001, "127.0.0.1")

    const { text, status } = await tepper(server).get("/hello").run()

    expect(status).toEqual(200)
    expect(text).toEqual("world")

    await expectServerToBeClosed(server)
  })

  it("works with a server that is not listening", async () => {
    const app = express().get("/", (_req, res) => {
      res.send("hey")
    })
    const server = http.createServer(app)

    const { text, status } = await tepper(server).get("/").run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await expectServerToBeClosed(server)
  })

  it("should work with remote server", async () => {
    const app = express().get("/", (_req, res) => {
      res.send("hey")
    })
    const server = await listenAppPromised(app, 4002, "127.0.0.1")

    const { text, status } = await tepper(`http://127.0.0.1:4002`)
      .get("/")
      .run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await closePromised(server)
  })

  it("should work with remote server and custom path", async () => {
    const app = express().get("/hello", (_req, res) => {
      res.send("hey")
    })
    const server = await listenAppPromised(app, 4001, "127.0.0.1")

    const { text, status } = await tepper(`http://127.0.0.1:4001`)
      .get("/hello")
      .run()

    expect(status).toEqual(200)
    expect(text).toEqual("hey")

    await closePromised(server)
  })
})
