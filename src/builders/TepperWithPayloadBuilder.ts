import { ParsedUrlQueryInput } from "querystring"
import { BaseUrlServerOrExpress } from "../BaseUrlServerOrExpress.js"
import { TepperConfig } from "../TepperConfig.js"
import { StandardError } from "../StandardError.js"
import { TepperWithoutPayloadBuilder } from "./TepperWithoutPayloadBuilder.js"

export class TepperWithPayloadBuilder<
  ExpectedResponse,
  ErrorType = StandardError,
> extends TepperWithoutPayloadBuilder<ExpectedResponse, ErrorType> {
  public constructor(
    baseUrlServerOrExpress: BaseUrlServerOrExpress,
    config: TepperConfig,
  ) {
    super(baseUrlServerOrExpress, config)
  }

  public send(body: string | object) {
    this.config.body = body
    return this
  }

  public sendForm(form: object) {
    this.send(form)
    this.config.isForm = true
    return this
  }

  public redirects(amount: number) {
    super.redirects(amount)
    return this
  }

  public timeout(timeout: number) {
    super.timeout(timeout)
    return this
  }

  public authWith(jwt: string) {
    super.authWith(jwt)
    return this
  }

  public withQuery(query: ParsedUrlQueryInput) {
    super.withQuery(query)
    return this
  }

  public withHeaders(headers: Record<string, string>) {
    super.withHeaders(headers)
    return this
  }

  public withCookies(cookies: Record<string, string>) {
    super.withCookies(cookies)
    return this
  }

  public debug() {
    super.debug()
    return this
  }

  public expect(
    target: string | number | Record<string, unknown> | Array<unknown>,
  ) {
    super.expect(target)
    return this
  }

  public expectStatus(status: number) {
    super.expectStatus(status)
    return this
  }

  public expectBody(body: string | Record<string, unknown> | Array<unknown>) {
    super.expectBody(body)
    return this
  }
}
