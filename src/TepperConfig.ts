import { ParsedUrlQueryInput } from "querystring"
import { DebugOptions } from "./DebugOptions"

export type TepperConfig = {
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  readonly path: string
  readonly body: Record<string, unknown> | Array<unknown> | null
  readonly query: ParsedUrlQueryInput | null
  readonly redirects: number
  readonly expectedStatus: number | null
  readonly expectedBody:
    | string
    | Record<string, unknown>
    | Array<unknown>
    | null
  readonly timeout: number | null
  readonly jwt: string | null
  readonly debug: Partial<DebugOptions> | null
}
