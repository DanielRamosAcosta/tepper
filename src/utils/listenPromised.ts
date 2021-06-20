import { Server } from "http"
import { Express } from "express"

export function listenAppPromised(
  app: Express,
  port: number,
  hostname: string,
) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(port, hostname, () => {
      resolve(server)
    })
  })
}

export function listenServerPromised(
  server: Server,
  port: number,
  hostname: string,
) {
  return new Promise<Server>((resolve) => {
    server.listen(port, hostname, () => {
      resolve(server)
    })
  })
}
