import { DebugOptions } from "./DebugOptions.js"

export type TepperConfig = {
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  readonly path: string
  body: string | object | null
  isForm: boolean
  query: object | null
  redirects: number
  expectedStatus: number | null
  expectedBody: string | Record<string, unknown> | Array<unknown> | null
  timeout: number | null
  jwt: string | null
  debug: boolean
  customHeaders: Record<string, string>
  cookies: Record<string, string>
  readonly expectToEqual: (a: unknown, b: unknown) => void
  readonly fetch: (...args: any[]) => Promise<any>
}
