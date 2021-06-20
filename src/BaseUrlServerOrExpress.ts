import { Server } from "http"
import { Express } from "express"

type BaseUrl = string

export type BaseUrlServerOrExpress = BaseUrl | Server | Express
