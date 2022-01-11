import express from "express"
import multer from "multer"
import fs from "fs"
import tepper from "../src/tepper"

describe("forms", () => {
  it("supports sending a single file", async () => {
    const upload = multer({ storage: multer.memoryStorage() })
    const app = express().post(
      "/profile",
      upload.single("document"),
      (req, res) => {
        res.send({
          document: req.file?.buffer?.toString("base64"),
          ...req.body,
        })
      },
    )

    const { body } = await tepper(app)
      .post("/profile")
      .sendForm({
        name: "Peter",
        document: fs.createReadStream("./test/fixtures/1.txt"),
      })
      .run()

    expect(body).toEqual({
      name: "Peter",
      document: "MQo=",
    })
  })

  it("supports sending a an array of files in a field", async () => {
    const upload = multer({ storage: multer.memoryStorage() })
    const app = express().post(
      "/profile",
      upload.array("documents"),
      (req, res) => {
        res.send({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          documents: req.files.map((file) => file.buffer.toString("base64")),
          ...req.body,
        })
      },
    )

    const { body } = await tepper(app)
      .post("/profile")
      .sendForm({
        name: "Peter",
        documents: [
          fs.createReadStream("./test/fixtures/1.txt"),
          fs.createReadStream("./test/fixtures/2.txt"),
          fs.createReadStream("./test/fixtures/3.txt"),
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
})
