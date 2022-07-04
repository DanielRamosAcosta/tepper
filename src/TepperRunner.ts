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

  private static async run(
    endpoint: string,
    config: TepperConfig,
  ): Promise<TepperResult> {
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

    const result: TepperResult = {
      status: response.status,
      headers: response.headers,
      text,
      body: safeJsonParse(text) || null,
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

    this.runExpectations(result, config)

    return result
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

  private static async ensureServerIsListening(server: Server) {
    if (server.listening) {
      return
    }

    await listenServerPromised(server, 0, "127.0.0.1")
  }
}
