import { ReadStream, statSync } from "fs"
import { basename } from "path"
import mime from "mime-types"

export class FormFile {
  readonly #stream: ReadStream

  public static fromReadStream(stream: ReadStream) {
    const name =
      typeof stream.path === "string"
        ? basename(stream.path)
        : basename(stream.path.toString("utf-8"))

    const stat = statSync(stream.path)

    return new FormFile(name, stat.size, mime.lookup(name) || "", stream)
  }

  private constructor(
    public name: string,
    public size: number,
    public type: string,
    stream: ReadStream,
  ) {
    this.#stream = stream
  }

  public stream() {
    return this.#stream
  }

  public get [Symbol.toStringTag]() {
    return "File"
  }
}
