import { Headers } from "node-fetch"

export type TepperResult<ExpectedResponse> = {
  text: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: ExpectedResponse
  status: number
  headers: Headers
}
