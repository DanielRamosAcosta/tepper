import { Server } from "http"

export function closePromised(server: Server) {
  return new Promise<void>((resolve, reject) => {
    console.time("server close")
    server.close((error) => {
      console.timeEnd("server close")
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
