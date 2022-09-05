# Tepper

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/danielramosacosta/tepper/CI)](https://github.com/DanielRamosAcosta/tepper/actions)
[![codecov](https://codecov.io/gh/DanielRamosAcosta/tepper/branch/main/graph/badge.svg?token=OXZKO8EFMF)](https://codecov.io/gh/DanielRamosAcosta/tepper)
[![npm](https://img.shields.io/npm/v/tepper)](https://www.npmjs.com/package/tepper)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DanielRamosAcosta/tepper/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Modern HTTP expectation library inspired in [supertest](https://github.com/visionmedia/supertest)

## About

This library is a modern implementation of supertest, typescript-first and promise first for the modern ages. It supports jest and vitest.

## Installation

Install tepper as an npm module and save it to your package.json file as a development dependency:

```bash
npm install --save-dev tepper
```

# Example

You may pass an `http.Server`, or a `Function` to `tepper()` - if the server is not
already listening for connections then it is bound to an ephemeral port for you so
there is no need to keep track of ports.

```js
import tepper from "tepper"
import express from "express"

const app = express()

app.get("/user", (req, res) => {
  res.status(200).json({ name: "john" })
})

const { body } = await tepper(app).get("/user").expect(200).run()

console.log(body)
```

## Notes

Inspired by [supertest](https://github.com/visionmedia/supertest).

## License

MIT
