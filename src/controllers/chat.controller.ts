import {RequestWithUser} from "../middleware/authentication";
import express from "express";
import {generateStreamToken} from "../stream/stream";

export async function getStreamToken(req : RequestWithUser, res : express.Response){
    try{
        const token = generateStreamToken(req.user._id)

        res.status(200).json(
            {
                status : 200,
                data : {
                    stream_token : token
                }
            })
    }
    catch (e) {
        return res.status(500).json({
            status : 500,
            message : `Internal Server Error : ${e.message}`
        })
    }
}