import { ParsedUrlQueryInput } from "querystring"
import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress"
import { DebugOptions } from "./DebugOptions"
import { TepperConfig } from "./TepperConfig"
import { TepperResult } from "./TepperResult"
import { TepperRunner } from "./TepperRunner"
export class TepperBuilder {
  public constructor(
    private readonly baseUrlServerOrExpress: BaseUrlServerOrExpress,
    private readonly config: TepperConfig,
  ) {}

  public get(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "GET",
      path,
    })
  }

  public post(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "POST",
      path,
    })
  }

  public put(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "PUT",
      path,
    })
  }

  public patch(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "PATCH",
      path,
    })
  }

  public delete(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
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

  public async run(): Promise<TepperResult> {
    return TepperRunner.launchServerAndRun(
      this.baseUrlServerOrExpress,
      this.config,
    )
  }

  private then() {
    throw new Error("Do not place await in the builder, use .run() method")
  }
}
