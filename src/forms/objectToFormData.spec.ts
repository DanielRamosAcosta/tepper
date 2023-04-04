import { describe, it, expect } from "vitest"
import {
  ObjectEntries,
  objectToFormData,
  toPlainForm,
} from "./objectToFormData"

describe("objectToFormData", () => {
  it("works with a simple object", () => {
    const object = { name: "Peter", surname: "Smith" }

    const form = objectToFormData(object)

    expect(form.get("name")).toEqual("Peter")
    expect(form.get("surname")).toEqual("Smith")
  })

  it("works with nested keys", () => {
    const object = {
      name: "Peter",
      info: {
        surname: "Smith",
      },
    }

    const form = objectToFormData(object)

    expect(form.get("name")).toEqual("Peter")
    expect(form.get("info[surname]")).toEqual("Smith")
  })

  it("works with deep nested keys", () => {
    const object = {
      info: {
        surname: "Smith",
        company: {
          name: "Acid",
        },
      },
    }

    const form = objectToFormData(object)

    expect(form.get("info[surname]")).toEqual("Smith")
    expect(form.get("info[company][name]")).toEqual("Acid")
  })

  it("works with arrays", () => {
    const friends = ["friend1", "friend2"]
    const object = { friends }

    const form = objectToFormData(object)

    expect(form.getAll("friends")).toEqual(friends)
  })

  it("works with one level of nesting", () => {
    const objectEntries: ObjectEntries = [
      ["name", "Peter"],
      ["surname", "Smith"],
    ]

    const prefixed = toPlainForm(objectEntries)

    expect(prefixed).toEqual([
      ["[name]", "Peter"],
      ["[surname]", "Smith"],
    ])
  })

  it("works with two levels of nesting", () => {
    const object: ObjectEntries = [
      ["name", "Peter"],
      ["info", { surname: "Smith", company: "Acid" }],
    ]

    const prefixed = toPlainForm(object)

    expect(prefixed).toEqual([
      ["[name]", "Peter"],
      ["[info][surname]", "Smith"],
      ["[info][company]", "Acid"],
    ])
  })

  it("works with three levels of nesting", () => {
    const object: ObjectEntries = [
      ["name", "Peter"],
      ["info", { surname: "Smith", company: { id: "1", name: "Acid" } }],
    ]

    const prefixed = toPlainForm(object)

    expect(prefixed).toEqual([
      ["[name]", "Peter"],
      ["[info][surname]", "Smith"],
      ["[info][company][id]", "1"],
      ["[info][company][name]", "Acid"],
    ])
  })
})
