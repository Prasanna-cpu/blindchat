import express from "express";
import {
    acceptFriendRequest, getFriendRequests,
    getMyFriends, getOutgoingFriendRequests,
    getRecommendedUsers,
    sendFriendRequest
} from "../controllers/user.controller";

const userRouter = express.Router()

userRouter.get("/", getRecommendedUsers)
userRouter.get("/friends", getMyFriends)
userRouter.post("/friend-request/:id", sendFriendRequest)
userRouter.put("/friend-request/:id/accept", acceptFriendRequest)
userRouter.get("/friend-requests", getFriendRequests)
userRouter.get("/outgoing-requests", getOutgoingFriendRequests)

export default userRouter
