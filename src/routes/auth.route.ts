
import express from "express";
import {login, logout, onboard, signup} from "../controllers/auth.controller";
import {protectedRoute} from "../middleware/authentication";

const authRouter = express.Router()

authRouter.post("/login", login)
authRouter.post("/signup", signup)
authRouter.post("/logout", logout)
authRouter.post("/onboard", protectedRoute, onboard)

export default authRouter
