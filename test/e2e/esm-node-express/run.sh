#!/usr/bin/env bash

set -e

rm -rf node_modules app.js app.test.js package.json package-lock.json

cat << EOF > app.js
import express from "express"

export const app = express().get("/", (req, res) => {
  res.json({ status: "ok" })
})
EOF

cat << EOF > app.test.js
import { describe, it } from "node:test"
import assert from "node:assert/strict"
import tepper from "tepper"
import { app } from "./app.js"

describe("app", () => {
  it("works", async () => {
    const { status, body } = await tepper(app)
      .get("/")
      .expect(200)
      .expectBody({ status: "ok" })
      .run()

    assert.strictEqual(status, 200)
    assert.deepStrictEqual(body, { status: "ok" })
  })
})
EOF

npm init --yes
npm link --save-dev ../..
node --test
