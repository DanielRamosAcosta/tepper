import { Headers } from "node-fetch"

export type TepperResult = {
  text: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
  status: number
  headers: Headers
}
