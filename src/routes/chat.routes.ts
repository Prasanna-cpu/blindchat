
import express from "express"
import {getStreamToken} from "../controllers/chat.controller";

const chatRouter = express.Router()


chatRouter.get("/stream-token", getStreamToken)

export default chatRouter
