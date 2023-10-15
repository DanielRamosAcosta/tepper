#!/usr/bin/env bash

set -e

cd test/e2e/commonjs-mocha-express

rm -rf node_modules app.js app.test.js package.json package-lock.json

cat << EOF > app.js
const express = require("express")

const app = express().get("/", (req, res) => {
  res.json({ status: "ok" })
})

module.exports = { app }
EOF

cat << EOF > app.test.js
const nodeFetch = require("node-fetch")
const { expect } = require("chai")
const { tepper } = require("tepper")
const { app } = require("./app.js")

describe("app", () => {
  it("works", async () => {
    const config = "fetch" in globalThis ? {} : { fetch: nodeFetch }

    const { status, body } = await tepper(app, config)
      .get("/")
      .expect(200)
      .expectBody({ status: "ok" })
      .run()

    expect(status).to.equal(200)
    expect(body).to.deep.equal({ status: "ok" })
  })
})
EOF

npm init --yes
npm install --save-dev mocha chai node-fetch@2
npm link --save-dev ../../..
npx mocha "*.test.js"
