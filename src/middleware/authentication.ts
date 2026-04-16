import express from "express";
import jwt , {JwtPayload} from "jsonwebtoken"
import User from "../models/User";

interface JwtPayloadWithUserId extends JwtPayload{
    userId : string
}

export interface RequestWithUser extends express.Request{
    user? : any
}


export const protectedRoute = async(req : RequestWithUser, res : express.Response, next: express.NextFunction)=> {
    try{
        const token = req.cookies.jwt

        if(!token){
            return res.status(401).json({
                status : 401,
                message : "Unauthorized"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadWithUserId

        if(!decoded) {
            return res.status(401).json({
                status : 401,
                message : "Unauthorized , invalid token"
            })
        }

        const user =await User.findById(decoded.userId)

        if(!user) {
            return res.status(401).json({
                status : 401,
                message : "Unauthorized , user not found"
            })
        }

        req.user = user
        console.log(req.user)
        next()
    }
    catch(e){
        console.log(e.message)
        return res.status(500).json({
            status : 500,
            message : `Internal server error : ${e.message}`
        })
    }
}