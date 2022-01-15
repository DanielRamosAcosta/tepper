import { Headers } from "node-fetch"

export type TepperResult<ExpectedResponse, ErrorType> = {
  text: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: ExpectedResponse & ErrorType
  status: number
  headers: Headers
}
