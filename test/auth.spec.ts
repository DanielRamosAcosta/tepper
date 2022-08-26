import express from "express"
import tepper from "../src/tepper"

describe("auth", () => {
  describe("deprecated symbol", () => {
    it("sends configured jwt", async () => {
      const app = express().get("/", (req, res) => {
        res.send(req.headers.authorization)
      })

      const jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

      const { text } = await tepper(app).authWith(jwt).get("/").run()

      expect(text).toEqual(`Bearer ${jwt}`)
    })
    describe("new proposal", () => {
      it("sends configured jwt as Bearer token", async () => {
        const app = express().get("/", (req, res) => {
          res.send(req.headers.authorization)
        })

        const jwt =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

        const { text } = await tepper(app).auth().withBearer(jwt).get("/").run()

        expect(text).toEqual(`Bearer ${jwt}`)
      })

      it("authenticates with user and password", async () => {
        const registeredUser = "user"
        const userPassword = "password"
        const expectedHeader = `Basic ${Buffer.from(
          registeredUser + ":" + userPassword,
        ).toString("base64")}`
        const app = express().get("/", (req, res) => {
          res.send(req.headers.authorization)
        })

        const { text } = await tepper(app)
          .auth()
          .withBasicAuth(registeredUser, userPassword)
          .get("/")
          .run()

        expect(text).toEqual(expectedHeader)
      })
    })
  })
})
