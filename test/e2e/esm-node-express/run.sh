#!/usr/bin/env bash

set -e

cd test/e2e/esm-node-express

rm -rf node_modules app.mjs app.test.mjs package.json package-lock.json

cat << EOF > app.mjs
import express from "express"

export const app = express().get("/", (req, res) => {
  res.json({ status: "ok" })
})
EOF

cat << EOF > app.test.mjs
import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { tepper } from "tepper"
import { app } from "./app.mjs"

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
npm install --save express
npm link --save-dev ../../..
node --test --test-reporter spec
