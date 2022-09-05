import { Express } from "express"
import { Server } from "http"
import fetch from "node-fetch"
import { Readable } from "stream"
import { FormDataEncoder } from "form-data-encoder"
import { listenAppPromised, listenServerPromised } from "./utils/listenPromised"
import { getBaseUrl } from "./utils/getBaseUrl"
import { closePromised } from "./utils/closePromised"
import { safeJsonParse } from "./utils/safeJsonParse"
import { TepperConfig } from "./TepperConfig"
import { TepperResult } from "./TepperResult"
import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress"
import { objectToFormData } from "./forms/objectToFormData"
import { objectToQueryString } from "./queries/objectToQueryString"

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
    const endpointWithQuery = this.appendQuery(endpoint, config)
    const { body, headers } = this.insertBodyIfPresent(config)

    const cookies = this.parseCookies(config.cookies)

    const response = await fetch(endpointWithQuery, {
      method: config.method,
      ...(body ? { body } : {}),
      headers: {
        ...headers,
        ...(config.jwt ? { Authorization: `Bearer ${config.jwt}` } : {}),
        ...config.customHeaders,
        cookie: cookies,
      },
      redirect: "manual",
      ...(config.timeout ? { timeout: config.timeout } : {}),
    })

    const text = await response.text()

    const result: TepperResult<ExpectedResponse, ErrorType> = {
      status: response.status,
      headers: response.headers,
      text,
      body: safeJsonParse<ExpectedResponse & ErrorType>(
        text,
      ) as ExpectedResponse & ErrorType,
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

    try {
      this.runExpectations<ExpectedResponse, ErrorType>(result, config)
    } catch (error: unknown) {
      throw this.cleanStackTrace(error)
    }

    return result
  }

  private static cleanStackTrace(error: unknown) {
    if (!(error instanceof Error)) return error

    const cleanedStack = (error.stack || "")
      .split("\n")
      .filter((stackLine) => !/at.+TepperRunner\.ts/.test(stackLine))
      .filter((stackLine) => !/at.+tepper\.ts/.test(stackLine))
      .filter((stackLine) => !/at.+Object\.expectToEqual/.test(stackLine))
      .join("\n")

    error.stack = cleanedStack

    return error
  }

  private static appendQuery(endpoint: string, config: TepperConfig) {
    if (!config.query) {
      return endpoint
    }

    return endpoint
      .concat("?")
      .concat(objectToQueryString(config.query).toString())
  }

  private static insertBodyIfPresent(config: TepperConfig): {
    body: any
    headers: object
  } {
    const body = config.body
    if (!body) {
      return { body: null, headers: {} }
    }

    if (typeof body === "object") {
      if (config.isForm) {
        const form = objectToFormData(body)
        const encoder = new FormDataEncoder(form)

        return { body: Readable.from(encoder), headers: encoder.headers }
      }

      return {
        body: JSON.stringify(body),
        headers: { "Content-Type": " application/json" },
      }
    }

    return { body, headers: {} }
  }

  private static parseCookies(cookies: Record<string, string>): string {
    return Object.keys(cookies)
      .map((key) => `${key}=${cookies[key]}`)
      .join("; ")
  }

  private static runExpectations<ExpectedResponse, ErrorType>(
    result: TepperResult<ExpectedResponse, ErrorType>,
    config: TepperConfig,
  ) {
    if (config.expectedBody) {
      if (typeof config.expectedBody === "string") {
        config.expectToEqual(result.text, config.expectedBody)
      } else {
        config.expectToEqual(result.body, config.expectedBody)
      }
    }

    if (config.expectedStatus) {
      config.expectToEqual(result.status, config.expectedStatus)
    }
  }

  private static async ensureServerIsListening(server: Server) {
    if (server.listening) {
      return
    }

    await listenServerPromised(server, 0, "127.0.0.1")
  }
}
