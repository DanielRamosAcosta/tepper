import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress"
import { TepperBuilder } from "./TepperBuilder"

export default function tepper(baseUrlExpressOrServer: BaseUrlServerOrExpress) {
  return new TepperBuilder(baseUrlExpressOrServer, {
    method: "GET",
    path: "/",
    body: null,
    redirects: 0,
    timeout: null,
    jwt: null,
    expectedBody: null,
    expectedStatus: null,
  })
}
