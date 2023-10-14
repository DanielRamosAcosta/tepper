import { ReadStream } from "fs"
import { FormData } from "formdata-node"
import { FormFile } from "./FormFile.js"

export type ObjectEntry = [string, any]
export type ObjectEntries = Array<ObjectEntry>

export function objectToFormData(object: object): FormData {
  const form = new FormData()

  for (const [key, value] of Object.entries(object)) {
    if (value == null) continue

    if (typeof value === "object") {
      if (value instanceof ReadStream) {
        form.append(key, FormFile.fromReadStream(value))
        continue
      }

      if (Array.isArray(value)) {
        for (const valueElement of value) {
          if (valueElement instanceof ReadStream) {
            form.append(key, FormFile.fromReadStream(valueElement))
            continue
          }

          form.append(key, valueElement)
        }

        continue
      }

      const data = toPlainForm(Object.entries(value))

      for (const [k, value] of data) {
        form.append(key + k, value)
      }

      continue
    }

    form.append(key, value)
  }

  return form
}

export function toPlainForm(objectEntries: ObjectEntries): ObjectEntries {
  return objectEntries.reduce((previous, [key, value]) => {
    if (typeof value === "object") {
      return [
        ...previous,
        ...toPlainForm(Object.entries(value)).map(
          ([k, value]): ObjectEntry => [`[${key}]${k}`, value],
        ),
      ]
    }

    return [...previous, [`[${key}]`, value]]
  }, [] as ObjectEntries)
}
