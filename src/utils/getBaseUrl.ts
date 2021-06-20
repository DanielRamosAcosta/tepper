import { Server } from "http"
import { AddressInfo } from "net"

function isAddressInfo(
  params: string | AddressInfo | null,
): params is AddressInfo {
  if (!params) {
    return false
  }

  return typeof params !== "string"
}

export function getBaseUrl(server: Server) {
  const addressInfo = server.address()

  if (!isAddressInfo(addressInfo)) {
    throw new Error(`Address is not an object`)
  }

  return `http://${addressInfo.address}:${addressInfo.port}`
}
