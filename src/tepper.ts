import { strict as assert } from "node:assert"
import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress.js"
import { TepperConfig } from "./TepperConfig.js"
import { TepperBuilder } from "./builders/TepperBuilder.js"

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
    debug: false,
    customHeaders: {},
    cookies: {},
    expectToEqual: (a, b) => {
      assert.deepStrictEqual(a, b)
    },
    fetch: (...args) => fetch(args[0], args[1]),
    ...config,
  })
}
