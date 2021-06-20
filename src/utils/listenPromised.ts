import { Server } from "http"
import { Express } from "express"

export function listenPromised(app: Express, port: number, hostname: string) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(port, hostname, () => {
      resolve(server)
    })
  })
}
