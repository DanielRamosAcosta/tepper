import { objectToQueryString } from "./objectToQueryString"

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
})
