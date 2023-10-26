import { ParsedUrlQueryInput } from "querystring"
import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress.js"
import { DebugOptions } from "./DebugOptions.js"
import { TepperConfig } from "./TepperConfig.js"
import { TepperResult } from "./TepperResult.js"
import { TepperRunner } from "./TepperRunner.js"
import { StandardError } from "./StandardError"

export class TepperWithPayloadBuilder<
  ExpectedResponse,
  ErrorType = StandardError,
> {
  public constructor(
    private readonly baseUrlServerOrExpress: BaseUrlServerOrExpress,
    private readonly config: TepperConfig,
  ) {}

  public send(body: string | object) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        body,
      },
    )
  }

  public sendForm(form: object) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        body: form,
        isForm: true,
      },
    )
  }

  public redirects(amount: number) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        redirects: amount,
      },
    )
  }

  public timeout(timeout: number) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        timeout,
      },
    )
  }

  public authWith(jwt: string) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        jwt,
      },
    )
  }

  public withQuery(query: ParsedUrlQueryInput) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        query,
      },
    )
  }

  public withHeaders(headers: Record<string, string>) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        customHeaders: headers,
      },
    )
  }

  public withCookies(cookies: Record<string, string>) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        cookies,
      },
    )
  }

  public debug() {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        debug: true,
      },
    )
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
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        expectedStatus: status,
      },
    )
  }

  public expectBody(body: string | Record<string, unknown> | Array<unknown>) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        expectedBody: body,
      },
    )
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
