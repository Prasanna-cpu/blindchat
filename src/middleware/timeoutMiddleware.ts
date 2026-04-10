import express from "express";


export const timeOutMiddleware = (millis : number) => {
    return (req : any, res : express.Response, next : any)=> {

        const timeout = setTimeout(() => {
            if(!res.headersSent) {
                return res.status(408).json({
                    status : 408,
                    message : "Request Timeout"
                })
            }
        }, millis)

        res.on("finish", () => clearTimeout(timeout))
        res.on("close", () => clearTimeout(timeout))

        next()

    }
}