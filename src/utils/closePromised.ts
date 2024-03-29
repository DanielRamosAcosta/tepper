import { Server } from "http"

export function closePromised(server: Server) {
  return new Promise<void>((resolve, reject) => {
    if ("closeAllConnections" in server) {
      server.closeAllConnections()
    }

    server.close((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
