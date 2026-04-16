
import express from "express";
import {login, logout, onboard, signup} from "../controllers/auth.controller";
import {protectedRoute, RequestWithUser} from "../middleware/authentication";

const authRouter = express.Router()

authRouter.post("/login", login)
authRouter.post("/signup", signup)
authRouter.post("/logout", logout)
authRouter.post("/onboard", protectedRoute, onboard)

authRouter.get("/me", protectedRoute, (req : RequestWithUser, res : express.Response) => {
    try{
        res.status(200).json({
            status : 200,
            data : {
                user : req.user
            }
        })
    }
    catch (e) {
        return res.status(500).json({
            status: 500,
            error: e.message || "Internal server error"
        });
    }
})

export default authRouter
