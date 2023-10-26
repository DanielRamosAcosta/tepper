import { ParsedUrlQueryInput } from "querystring"
import { BaseUrlServerOrExpress } from "../BaseUrlServerOrExpress.js"
import { TepperConfig } from "../TepperConfig.js"
import { TepperResult } from "../TepperResult.js"
import { TepperRunner } from "../TepperRunner.js"
import { StandardError } from "../StandardError"

export class TepperWithoutPayloadBuilder<
  ExpectedResponse,
  ErrorType = StandardError,
> {
  public constructor(
    protected readonly baseUrlServerOrExpress: BaseUrlServerOrExpress,
    protected config: TepperConfig,
  ) {}

  public redirects(amount: number) {
    this.config.redirects = amount
    return this
  }

  public timeout(timeout: number) {
    this.config.timeout = timeout
    return this
  }

  public authWith(jwt: string) {
    this.config.jwt = jwt
    return this
  }

  public withQuery(query: ParsedUrlQueryInput) {
    this.config.query = query
    return this
  }

  public withHeaders(headers: Record<string, string>) {
    this.config.customHeaders = headers
    return this
  }

  public withCookies(cookies: Record<string, string>) {
    this.config.cookies = cookies
    return this
  }

  public debug() {
    this.config.debug = true
    return this
  }

  public expect(
    target: string | number | Record<string, unknown> | Array<unknown>,
  ) {
    if (typeof target === "number") {
      return this.expectStatus(target)
    }

    if (typeof target === "string") {
      return this.expectBody(target)
    }

    if (typeof target === "object") {
      return this.expectBody(target)
    }

    throw new Error(`I dont know what to expect from ${target}`)
  }

  public expectStatus(status: number) {
    this.config.expectedStatus = status
    return this
  }

  public expectBody(body: string | Record<string, unknown> | Array<unknown>) {
    this.config.expectedBody = body
    return this
  }

  public async run(): Promise<TepperResult<ExpectedResponse, ErrorType>> {
    return TepperRunner.launchServerAndRun<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      this.config,
    )
  }

  private then() {
    throw new Error("Do not place await in the builder, use .run() method")
  }
}
