import { Server } from "http"
import { Express } from "express"

export type BaseUrl = string

export type BaseUrlServerOrExpress = BaseUrl | Server | Express
