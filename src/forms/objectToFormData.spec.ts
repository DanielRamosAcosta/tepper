import { describe, expect, it } from "vitest"
import { createReadStream } from "fs"
import { Readable } from "stream"
import { FormDataEncoder } from "form-data-encoder"
import { FormData } from "formdata-node"
import {
  ObjectEntries,
  objectToFormData,
  toPlainForm,
} from "./objectToFormData.js"

async function toStringRepresentation(form: FormData) {
  const encoder = new FormDataEncoder(form)
  const readable = Readable.from(encoder)
  const buffer = await new Promise<Buffer>((resolve) => {
    const chunks: Buffer[] = []
    readable.on("data", (chunk) => chunks.push(chunk))
    readable.on("end", () => resolve(Buffer.concat(chunks)))
  })

  return buffer.toString()
}

function removeRandomnessOfForm(formDataString: string) {
  return formDataString.replace(
    /--form-data-boundary-\w{16}/g,
    "--form-data-boundary-xxxxxxxxxxxxxxxx",
  )
}

function crlfToLf(data: string) {
  return data.replace(/\r\n/g, "\n")
}

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

  it("adds files to the form", async () => {
    const object = {
      name: "Peter",
      documents: [
        createReadStream("./test/fixtures/1.txt"),
        createReadStream("./test/fixtures/2.txt"),
        createReadStream("./test/fixtures/3.txt"),
      ],
    }

    const form = objectToFormData(object)

    const formString = await toStringRepresentation(form)
      .then(removeRandomnessOfForm)
      .then(crlfToLf)
    expect(formString).toEqual(`--form-data-boundary-xxxxxxxxxxxxxxxx
Content-Disposition: form-data; name="name"

Peter
--form-data-boundary-xxxxxxxxxxxxxxxx
Content-Disposition: form-data; name="documents"; filename="1.txt"
Content-Type: text/plain

1

--form-data-boundary-xxxxxxxxxxxxxxxx
Content-Disposition: form-data; name="documents"; filename="2.txt"
Content-Type: text/plain

2

--form-data-boundary-xxxxxxxxxxxxxxxx
Content-Disposition: form-data; name="documents"; filename="3.txt"
Content-Type: text/plain

3

--form-data-boundary-xxxxxxxxxxxxxxxx--

`)
  })
})
