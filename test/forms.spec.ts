import { it, expect, describe } from "vitest"
import express from "express"
import multer from "multer"
import { createReadStream } from "fs"
import tepper from "../src/tepper"

describe("forms", () => {
  it("supports sending a single file with fs.createReadStream", async () => {
    const upload = multer({ storage: multer.memoryStorage() })
    const app = express().post(
      "/profile",
      upload.single("document"),
      (req, res) => {
        const { file } = req
        if (file) {
          res.send({
            document: {
              content: file.buffer.toString("base64"),
              filename: file.originalname,
              mimetype: file.mimetype,
            },
            ...req.body,
          })
        }
      },
    )

    const { body } = await tepper(app)
      .post("/profile")
      .sendForm({
        name: "Peter",
        document: createReadStream("./test/fixtures/1.txt"),
      })
      .run()

    expect(body).toEqual({
      name: "Peter",
      document: {
        content: "MQo=",
        filename: "1.txt",
        mimetype: "text/plain",
      },
    })
  })

  it("supports sending from a path", async () => {
    const upload = multer({ storage: multer.memoryStorage() })
    const app = express().post(
      "/profile",
      upload.single("document"),
      (req, res) => {
        const { file } = req
        if (file) {
          res.send({
            document: {
              content: file.buffer.toString("base64"),
              filename: file.originalname,
              mimetype: file.mimetype,
            },
            ...req.body,
          })
        }
      },
    )

    const { body } = await tepper(app)
      .post("/profile")
      .sendForm({
        name: "Peter",
        document: createReadStream("./test/fixtures/1.txt"),
      })
      .run()

    expect(body).toEqual({
      name: "Peter",
      document: {
        content: "MQo=",
        filename: "1.txt",
        mimetype: "text/plain",
      },
    })
  })

  it("supports sending a an array of files in a field", async () => {
    const upload = multer({ storage: multer.memoryStorage() })
    const app = express().post(
      "/profile",
      upload.array("documents"),
      (req, res) => {
        const files = req.files
        if (Array.isArray(files)) {
          res.send({
            documents: files.map((file) => file.buffer.toString("base64")),
            ...req.body,
          })
        } else {
          res.status(500).send("No files")
        }
      },
    )

    const { body } = await tepper(app)
      .post("/profile")
      .sendForm({
        name: "Peter",
        documents: [
          createReadStream("./test/fixtures/1.txt"),
          createReadStream("./test/fixtures/2.txt"),
          createReadStream("./test/fixtures/3.txt"),
        ],
      })
      .run()

    expect(body).toEqual({
      name: "Peter",
      documents: ["MQo=", "Mgo=", "Mwo="],
    })
  })

  it("supports nested fields", async () => {
    const upload = multer({ storage: multer.memoryStorage() })
    const app = express().post("/profile", upload.none(), (req, res) => {
      res.send({
        ...req.body,
      })
    })

    const { body } = await tepper(app)
      .post("/profile")
      .sendForm({
        name: "Peter",
        paymentInfo: {
          clientId: "0x12345",
          amount: 10,
        },
      })
      .run()

    expect(body).toEqual({
      name: "Peter",
      paymentInfo: {
        clientId: "0x12345",
        amount: "10",
      },
    })
  })

  it("skips undefined values", async () => {
    const upload = multer({ storage: multer.memoryStorage() })
    const app = express().post("/profile", upload.none(), (req, res) => {
      res.send({
        ...req.body,
      })
    })

    const { body } = await tepper(app)
      .post("/profile")
      .sendForm({
        name: "Peter",
        paymentInfo: undefined,
      })
      .run()

    expect(body).toEqual({
      name: "Peter",
    })
  })

  it("supports sending arrays", async () => {
    const upload = multer({ storage: multer.memoryStorage() })
    const app = express().post("/profile", upload.none(), (req, res) => {
      res.send({
        ...req.body,
      })
    })

    const { body } = await tepper(app)
      .post("/profile")
      .sendForm({
        friends: ["friend1", "friend2"],
      })
      .run()

    expect(body).toEqual({
      friends: ["friend1", "friend2"],
    })
  })
})
