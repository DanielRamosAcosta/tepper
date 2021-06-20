import { Headers } from "node-fetch"

export type TepperResult = {
  text: string
  body: Record<string, unknown>
  status: number
  headers: Headers
}
