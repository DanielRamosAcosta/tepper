import { Readable } from "stream"
import { FormDataEncoder } from "form-data-encoder"
import { safeJsonParse } from "./utils/safeJsonParse.js"
import { TepperConfig } from "./TepperConfig.js"
import { TepperResult } from "./TepperResult.js"
import { BaseUrl } from "./BaseUrlServerOrExpress.js"
import { objectToFormData } from "./forms/objectToFormData.js"
import { objectToQueryString } from "./queries/objectToQueryString.js"

export class TepperRunner<ExpectedResponse, ErrorType> {
  public async run(
    baseUrl: BaseUrl,
    config: TepperConfig,
  ): Promise<TepperResult<ExpectedResponse, ErrorType>> {
    const endpoint = `${baseUrl}${config.path}`
    const endpointWithQuery = this.appendQuery(endpoint, config)
    const { body, headers } = this.insertBodyIfPresent(config)

    const cookies = this.serializeCookies(config.cookies)

    const configFetch: typeof fetch = config.fetch
    const response = await configFetch(endpointWithQuery, {
      method: config.method,
      ...(body ? { body } : {}),
      headers: {
        ...headers,
        ...(config.jwt ? { Authorization: `Bearer ${config.jwt}` } : {}),
        ...config.customHeaders,
        cookie: cookies,
      },
      redirect: "manual",
      ...(config.timeout
        ? { signal: AbortSignal.timeout(config.timeout) }
        : {}),
      duplex: "half",
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

    if (config.debug) {
      // eslint-disable-next-line no-console
      console.dir(result.body, {
        depth: Infinity,
      })
    }

    if (result.status === 302 && config.redirects > 0) {
      const newLocation = result.headers.get("Location") as string

      return this.run(baseUrl, {
        ...config,
        path: newLocation,
        method: "GET",
        body: null,
        redirects: config.redirects - 1,
      })
    }

    try {
      this.runExpectations(result, config)
    } catch (error: unknown) {
      throw this.cleanStackTrace(error)
    }

    return result
  }

  private cleanStackTrace(error: unknown) {
    if (!(error instanceof Error)) return error

    const cleanedStack = (error.stack || "")
      .split("\n")
      .filter((stackLine) => !/at.+ServerLauncher\.ts/.test(stackLine))
      .filter((stackLine) => !/at.+tepper\.ts/.test(stackLine))
      .filter((stackLine) => !/at.+Object\.expectToEqual/.test(stackLine))
      .join("\n")

    error.stack = cleanedStack

    return error
  }

  private appendQuery(endpoint: string, config: TepperConfig) {
    if (!config.query) {
      return endpoint
    }

    return endpoint
      .concat("?")
      .concat(objectToQueryString(config.query).toString())
  }

  private insertBodyIfPresent(config: TepperConfig): {
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

  private serializeCookies(cookies: Record<string, string>): string {
    return Object.keys(cookies)
      .map((key) => `${key}=${cookies[key]}`)
      .join("; ")
  }

  private runExpectations(
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
}
