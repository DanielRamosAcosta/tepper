import { Express } from "express"
import { Server } from "http"
import { listenPromised } from "./utils/listenPromised"
import { getBaseUrl } from "./utils/getBaseUrl"
import { closePromised } from "./utils/closePromised"
import fetch from "node-fetch"
import { safeJsonParse } from "./utils/safeJsonParse"
import { TepperConfig } from "./TepperConfig"
import { TepperResult } from "./TepperResult"
import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress"

function isExpressApp(
  baseUrlServerOrExpress: BaseUrlServerOrExpress,
): baseUrlServerOrExpress is Express {
  return typeof baseUrlServerOrExpress === "function"
}

function isServer(
  baseUrlServerOrExpress: BaseUrlServerOrExpress,
): baseUrlServerOrExpress is Server {
  return typeof baseUrlServerOrExpress === "object"
}

export class TepperRunner {
  private static async instantiateExpress(
    baseUrlServerOrExpress: Express,
  ): Promise<Server> {
    const app = baseUrlServerOrExpress
    const address = "127.0.0.1"
    const port = 8080

    return await listenPromised(app, port, address)
  }

  public static async launchServerAndRun(
    baseUrlServerOrExpress: BaseUrlServerOrExpress,
    config: TepperConfig,
  ): Promise<TepperResult> {
    if (isExpressApp(baseUrlServerOrExpress)) {
      const server = await this.instantiateExpress(baseUrlServerOrExpress)

      return this.launchServerAndRun(server, config)
    }

    if (isServer(baseUrlServerOrExpress)) {
      const server = baseUrlServerOrExpress

      try {
        return await this.launchServerAndRun(getBaseUrl(server), config)
      } finally {
        await closePromised(server)
      }
    }

    const endpoint = `${baseUrlServerOrExpress}${config.path}`

    return this.run(endpoint, config)
  }

  private static async run(
    endpoint: string,
    config: TepperConfig,
  ): Promise<TepperResult> {
    const response = await fetch(endpoint, {
      method: config.method,
      ...(config.body ? { body: JSON.stringify(config.body) } : {}),
      headers: {
        ...(typeof config.body === "object"
          ? { "Content-Type": " application/json" }
          : {}),
        ...(config.jwt ? { Authorization: `Bearer ${config.jwt}` } : {}),
      },
      redirect: "manual",
      ...(config.timeout ? { timeout: config.timeout } : {}),
    })

    const text = await response.text()

    const result: TepperResult = {
      status: response.status,
      headers: response.headers,
      text,
      body: safeJsonParse(text) || {},
    }

    if (result.status === 302 && config.redirects > 0) {
      const newLocation = result.headers.get("Location") as string

      return this.run(newLocation, {
        ...config,
        method: "GET",
        body: null,
        redirects: config.redirects - 1,
      })
    }

    this.runExpectations(result, config)

    return result
  }

  private static runExpectations(result: TepperResult, config: TepperConfig) {
    if (config.expectedBody) {
      if (typeof config.expectedBody === "string") {
        expect(result.text).toEqual(config.expectedBody)
      } else {
        expect(result.body).toEqual(config.expectedBody)
      }
    }

    if (config.expectedStatus) {
      expect(result.status).toEqual(config.expectedStatus)
    }
  }
}
