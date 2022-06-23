import { URLSearchParams } from "url"

export function objectToQueryString(query: object) {
  const params = new URLSearchParams()
  const arrayIndicator = "__array_indicator__"

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        params.append(key + arrayIndicator, v)
      }
    } else if (value != null) {
      params.append(key, (value && value.toString()) || "")
    }
  }

  return params.toString().replace(new RegExp(arrayIndicator, "g"), "[]")
}
