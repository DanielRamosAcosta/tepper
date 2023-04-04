import { expect } from "vitest"
import { Server } from "http"
import { closePromised } from "../../src/utils/closePromised"

export async function expectServerToBeClosed(server: Server) {
  const promise = closePromised(server).catch((error) =>
    Promise.reject(error.code),
  )

  await expect(promise).rejects.toEqual("ERR_SERVER_NOT_RUNNING")
}
