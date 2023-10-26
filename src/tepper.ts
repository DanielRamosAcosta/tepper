import assert from "node:assert"
import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress.js"
import { TepperBuilder } from "./TepperBuilder.js"
import { TepperConfig } from "./TepperConfig.js"

export function tepper(
  baseUrlExpressOrServer: BaseUrlServerOrExpress,
  config?: Partial<TepperConfig>,
) {
  return new TepperBuilder(baseUrlExpressOrServer, {
    method: "GET",
    path: "/",
    body: null,
    isForm: false,
    query: null,
    redirects: 0,
    timeout: null,
    jwt: null,
    expectedBody: null,
    expectedStatus: null,
    debug: null,
    customHeaders: {},
    cookies: {},
    expectToEqual: (a, b) => {
      console.log("Strict log", assert)
      console.log("Strict log", assert.strict)
      console.log("Strict log", assert.strict.deepStrictEqual)
      assert.strict.deepStrictEqual(a, b)
    },
    fetch: (...args) => fetch(...args),
    ...config,
  })
}
