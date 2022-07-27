import { ParsedUrlQueryInput } from "querystring"
import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress"
import { DebugOptions } from "./DebugOptions"
import { TepperConfig } from "./TepperConfig"
import { TepperResult } from "./TepperResult"
import { TepperRunner } from "./TepperRunner"

type StandardError = {
  error: {
    status: number,
    code: string,
    message: string
  }
}
export class TepperBuilder<ExpectedResponse, ErrorType = StandardError> {
  public constructor(
    private readonly baseUrlServerOrExpress: BaseUrlServerOrExpress,
    private readonly config: TepperConfig,
  ) {}

  public get<ExpectedResponse = any, ErrorType = StandardError>(path: string) {
    return new TepperBuilder<ExpectedResponse, ErrorType>(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "GET",
      path,
    })
  }

  public post<ExpectedResponse = any, ErrorType = StandardError>(path: string) {
    return new TepperBuilder<ExpectedResponse, ErrorType>(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "POST",
      path,
    })
  }

  public put<ExpectedResponse = any, ErrorType = StandardError>(path: string) {
    return new TepperBuilder<ExpectedResponse, ErrorType>(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "PUT",
      path,
    })
  }

  public patch<ExpectedResponse = any, ErrorType = StandardError>(path: string) {
    return new TepperBuilder<ExpectedResponse, ErrorType>(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "PATCH",
      path,
    })
  }

  public delete<ExpectedResponse = any, ErrorType = StandardError>(path: string) {
    return new TepperBuilder<ExpectedResponse, ErrorType>(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "DELETE",
      path,
    })
  }

  public send(body: string | object) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      body,
    })
  }

  public sendForm(form: object) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      body: form,
      isForm: true,
    })
  }

  public redirects(amount: number) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      redirects: amount,
    })
  }

  public timeout(timeout: number) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      timeout,
    })
  }

  public authWith(jwt: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      jwt,
    })
  }

  public withQuery(query: ParsedUrlQueryInput) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      query,
    })
  }

  public withHeaders(headers: Record<string, string>) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      customHeaders: headers,
    })
  }

  public withCookies(cookies: Record<string, string>) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      cookies,
    })
  }

  public debug({ body = true }: Partial<DebugOptions> = {}) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      debug: this.config.debug
        ? {
            ...this.config.debug,
            body,
          }
        : { body },
    })
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
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      expectedStatus: status,
    })
  }

  public expectBody(body: string | Record<string, unknown> | Array<unknown>) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      expectedBody: body,
    })
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
