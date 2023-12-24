import { describe, it, expect } from "vitest"
import { objectToQueryString } from "./objectToQueryString.js"

describe("objectToQueryString", () => {
  it("serializes a query with strings", () => {
    const query = {
      hello: "world",
    }

    const result = objectToQueryString(query)

    expect(result).toEqual("hello=world")
  })

  it("serializes a query with an array", () => {
    const query = {
      tags: ["first-tag", "second-tag"],
    }

    const result = objectToQueryString(query)

    expect(result).toEqual("tags[]=first-tag&tags[]=second-tag")
  })

  it("skips undefined values", () => {
    const query = { empty: undefined }

    const result = objectToQueryString(query)

    expect(result).toEqual("")
  })
})
