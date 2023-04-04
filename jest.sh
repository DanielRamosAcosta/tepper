#!/usr/bin/env bash

set -e

rm -rf jest-tepper

mkdir jest-tepper
cd jest-tepper
npm init -y
npm install -D jest

cat << EOF > index.spec.js
const express = require("express")
const { default: tepper } = require("..")

test("works with jest", async () => {
  const app = express()
    .use(express.json())
    .post("/", (req, res) => {
      res.send(req.body.name)
    })

  await tepper(app).post("/").send({ name: "john" }).expect("john").run()
})
EOF

./node_modules/.bin/jest

cd ..
rm -rf jest-tepper
