import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress"
import { TepperBuilder } from "./TepperBuilder"
import { TepperConfig } from "./TepperConfig"

export default function tepper(
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect: globalThis.expect,
    ...config,
  })
}
