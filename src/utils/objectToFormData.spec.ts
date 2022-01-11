import {
  ObjectEntries,
  objectToFormData,
  toPlainForm,
} from "./objectToFormData"
import fs from "fs"

describe("objectToFormData", () => {
  it("works with a simple object", () => {
    const object = { name: "Peter", surname: "Smith" }

    const form = objectToFormData(object)
    const data = form.getBuffer().toString("utf-8")

    expect(data).toContain(`Content-Disposition: form-data; name="name"`)
    expect(data).toContain(`Peter`)
    expect(data).toContain(`Content-Disposition: form-data; name="surname"`)
    expect(data).toContain(`Smith`)
  })

  it("works with nested keys", () => {
    const object = {
      name: "Peter",
      info: {
        surname: "Smith",
      },
    }

    const form = objectToFormData(object)
    const data = form.getBuffer().toString("utf-8")

    expect(data).toContain(`Content-Disposition: form-data; name="name"`)
    expect(data).toContain(`Peter`)
    expect(data).toContain(
      `Content-Disposition: form-data; name="info[surname]"`,
    )
    expect(data).toContain(`Smith`)
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
    const data = form.getBuffer().toString("utf-8")

    expect(data).toContain(
      `Content-Disposition: form-data; name="info[surname]"`,
    )
    expect(data).toContain(`Smith`)
    expect(data).toContain(
      `Content-Disposition: form-data; name="info[company][name]"`,
    )
    expect(data).toContain(`Acid`)
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
