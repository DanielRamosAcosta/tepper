import { TepperConfig } from "./TepperConfig"
import { TepperResult } from "./TepperResult"
import { TepperRunner } from "./TepperRunner"
import { BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress"

export class TepperBuilder {
  constructor(
    private readonly baseUrlServerOrExpress: BaseUrlServerOrExpress,
    private readonly config: TepperConfig,
  ) {}

  get(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "GET",
      path,
    })
  }

  post(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "POST",
      path,
    })
  }

  put(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "PUT",
      path,
    })
  }

  patch(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "PATCH",
      path,
    })
  }

  delete(path: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      method: "DELETE",
      path,
    })
  }

  send(body: Record<string, unknown>) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      body,
    })
  }

  redirects(amount: number) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      redirects: amount,
    })
  }

  timeout(timeout: number) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      timeout,
    })
  }

  authWith(jwt: string) {
    return new TepperBuilder(this.baseUrlServerOrExpress, {
      ...this.config,
      jwt,
    })
  }

  expect(target: string | number | Record<string, unknown>) {
    if (typeof target === "number") {
      return new TepperBuilder(this.baseUrlServerOrExpress, {
        ...this.config,
        expectedStatus: target,
      })
    }

    if (typeof target === "string" || typeof target === "object") {
      return new TepperBuilder(this.baseUrlServerOrExpress, {
        ...this.config,
        expectedBody: target,
      })
    }

    throw new Error(`I dont know what to expect from ${target}`)
  }

  async run(): Promise<TepperResult> {
    return TepperRunner.launchServerAndRun(
      this.baseUrlServerOrExpress,
      this.config,
    )
  }
}
