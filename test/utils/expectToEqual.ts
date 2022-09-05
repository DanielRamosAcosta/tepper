import { expect } from "vitest"

export function expectToEqual(a: unknown, b: unknown) {
  expect(a).toEqual(b)
}
