import { Express } from "express"
import { Server } from "http"
import fetch from "node-fetch"
import qs from "querystring"
import { listenAppPromised, listenServerPromised } from "./utils/listenPromised"
import { getBaseUrl } from "./utils/getBaseUrl"
import { closePromised } from "./utils/closePromised"
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
    return await listenAppPromised(baseUrlServerOrExpress, 0, "127.0.0.1")
  }

  public static async launchServerAndRun<ExpectedResponse, ErrorType>(
    baseUrlServerOrExpress: BaseUrlServerOrExpress,
    config: TepperConfig,
  ): Promise<TepperResult<ExpectedResponse, ErrorType>> {
    if (isExpressApp(baseUrlServerOrExpress)) {
      const server = await this.instantiateExpress(baseUrlServerOrExpress)

      return this.launchServerAndRun(server, config)
    }

    if (isServer(baseUrlServerOrExpress)) {
      const server = baseUrlServerOrExpress

      await this.ensureServerIsListening(server)

      try {
        return await this.launchServerAndRun(getBaseUrl(server), config)
      } finally {
        await closePromised(server)
      }
    }

    const endpoint = `${baseUrlServerOrExpress}${config.path}`

    return this.run(endpoint, config)
  }

  private static async run<ExpectedResponse, ErrorType>(
    endpoint: string,
    config: TepperConfig,
  ): Promise<TepperResult<ExpectedResponse, ErrorType>> {
    const endpointWithQuery = config.query
      ? endpoint.concat("?").concat(qs.stringify(config.query))
      : endpoint

    const response = await fetch(endpointWithQuery, {
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

    const result: TepperResult<ExpectedResponse, ErrorType> = {
      status: response.status,
      headers: response.headers,
      text,
      body: safeJsonParse<ExpectedResponse & ErrorType>(text) as ExpectedResponse & ErrorType
    }

    if (config.debug && config.debug.body) {
      console.dir(result.body, {
        depth: Infinity,
      })
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

    this.runExpectations<ExpectedResponse, ErrorType>(result, config)

    return result
  }

  private static runExpectations<ExpectedResponse, ErrorType>(result: TepperResult<ExpectedResponse, ErrorType>, config: TepperConfig) {
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

  private static async ensureServerIsListening(server: Server) {
    if (server.listening) {
      return
    }

    await listenServerPromised(server, 0, "127.0.0.1")
  }
}
