export type TepperConfig = {
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  readonly path: string
  readonly body: Record<string, unknown> | null
  readonly redirects: number
  readonly expectedStatus: number | null
  readonly expectedBody: string | Record<string, unknown> | null
  readonly timeout: number | null
  readonly jwt: string | null
}
