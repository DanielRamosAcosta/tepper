import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress"
import { TepperBuilder } from "./TepperBuilder"

export default function tepper(baseUrlExpressOrServer: BaseUrlServerOrExpress) {
  return new TepperBuilder(baseUrlExpressOrServer, {
    method: "GET",
    path: "/",
    body: null,
    isForm: false,
    query: null,
    redirects: 0,
    timeout: null,
    jwt: null,
    basicAuth: null,
    expectedBody: null,
    expectedStatus: null,
    debug: null,
    customHeaders: {},
    cookies: {},
  })
}
