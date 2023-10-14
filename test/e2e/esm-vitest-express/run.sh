#!/usr/bin/env bash

set -e

cd test/e2e/esm-vitest-express

rm -rf node_modules app.js app.test.js package.json package-lock.json

cat << EOF > app.js
import express from "express"

export const app = express().get("/", (req, res) => {
  res.json({ status: "ok" })
})
EOF

cat << EOF > app.test.js
import { describe, expect, it } from "vitest"
import nodeFetch from "node-fetch"
import tepper from "tepper"
import { app } from "./app.js"

describe("app", () => {
  it("works", async () => {
    const config = "fetch" in globalThis ? {} : { fetch: nodeFetch }

    const { status, body } = await tepper(app, config)
      .get("/")
      .expect(200)
      .expectBody({ status: "ok" })
      .run()

    expect(status).toBe(200)
    expect(body).toEqual({ status: "ok" })
  })
})
EOF

npm init --yes
npm install --save-dev vitest node-fetch
npm link --save-dev ../../..
npx vitest --run
