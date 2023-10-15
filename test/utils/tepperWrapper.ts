import { tepper as originalTepper } from "../../src/tepper"
import nodeFetch from "node-fetch"
import { BaseUrlServerOrExpress } from "../../src/BaseUrlServerOrExpress"
import { TepperConfig } from "../../src/TepperConfig"

export function tepper(
  baseUrlExpressOrServer: BaseUrlServerOrExpress,
  config?: Partial<TepperConfig>,
) {
  let fetch: any
  if ("fetch" in globalThis) {
    fetch = globalThis.fetch
  } else {
    fetch = nodeFetch
  }

  return originalTepper(baseUrlExpressOrServer, {
    ...config,
    fetch,
  })
}
