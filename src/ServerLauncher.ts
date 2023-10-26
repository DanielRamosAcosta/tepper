import { Express } from "express"
import { Server } from "http"
import {
  listenAppPromised,
  listenServerPromised,
} from "./utils/listenPromised.js"
import { getBaseUrl } from "./utils/getBaseUrl.js"
import { closePromised } from "./utils/closePromised.js"
import { TepperConfig } from "./TepperConfig.js"
import { TepperResult } from "./TepperResult.js"
import { BaseUrl, BaseUrlServerOrExpress } from "./BaseUrlServerOrExpress.js"
import { TepperRunner } from "./TepperRunner"

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

export class ServerLauncher<ExpectedResponse, ErrorType> {
  public async launchAndRun(
    baseUrlServerOrExpress: BaseUrlServerOrExpress,
    config: TepperConfig,
  ): Promise<TepperResult<ExpectedResponse, ErrorType>> {
    if (isExpressApp(baseUrlServerOrExpress)) {
      return await this.launchExpressAndRun(baseUrlServerOrExpress, config)
    }

    if (isServer(baseUrlServerOrExpress)) {
      return await this.launchServerAndRun(baseUrlServerOrExpress, config)
    }

    return await this.run(baseUrlServerOrExpress, config)
  }

  private async launchServerAndRun(server: Server, config: TepperConfig) {
    await this.ensureServerIsListening(server)

    try {
      return await this.launchAndRun(getBaseUrl(server), config)
    } finally {
      await closePromised(server)
    }
  }

  private async launchExpressAndRun(express: Express, config: TepperConfig) {
    const server = await listenAppPromised(express, 0, "127.0.0.1")
    return this.launchAndRun(server, config)
  }

  private async run(
    baseUrl: BaseUrl,
    config: TepperConfig,
  ): Promise<TepperResult<ExpectedResponse, ErrorType>> {
    const runner = new TepperRunner<ExpectedResponse, ErrorType>()
    return runner.run(baseUrl, config)
  }

  private async ensureServerIsListening(server: Server) {
    if (server.listening) {
      return
    }

    await listenServerPromised(server, 0, "127.0.0.1")
  }
}
