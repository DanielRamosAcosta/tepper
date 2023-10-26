import { BaseUrlServerOrExpress } from "../BaseUrlServerOrExpress.js"
import { TepperConfig } from "../TepperConfig.js"
import { StandardError } from "../StandardError"
import { TepperWithoutPayloadBuilder } from "./TepperWithoutPayloadBuilder"
import { TepperWithPayloadBuilder } from "./TepperWithPayloadBuilder"

export class TepperBuilder {
  public constructor(
    private readonly baseUrlServerOrExpress: BaseUrlServerOrExpress,
    private readonly config: TepperConfig,
  ) {}

  public get<ExpectedResponse = any, ErrorType = StandardError>(path: string) {
    return new TepperWithoutPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        method: "GET",
        path,
      },
    )
  }

  public post<ExpectedResponse = any, ErrorType = StandardError>(path: string) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        method: "POST",
        path,
      },
    )
  }

  public put<ExpectedResponse = any, ErrorType = StandardError>(path: string) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        method: "PUT",
        path,
      },
    )
  }

  public patch<ExpectedResponse = any, ErrorType = StandardError>(
    path: string,
  ) {
    return new TepperWithPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        method: "PATCH",
        path,
      },
    )
  }

  public delete<ExpectedResponse = any, ErrorType = StandardError>(
    path: string,
  ) {
    return new TepperWithoutPayloadBuilder<ExpectedResponse, ErrorType>(
      this.baseUrlServerOrExpress,
      {
        ...this.config,
        method: "DELETE",
        path,
      },
    )
  }
}
