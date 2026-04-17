
import express from "express";
import {RequestWithUser} from "../middleware/authentication";
import User from "../models/User";
import FriendRequest from "../models/FriendRequest";
import mongoose from "mongoose";

export async function getRecommendedUsers(req : RequestWithUser, res : express.Response) {

    try{
        const currentUserId = req.user.id
        const currentUser = req.user

        const recommendedUsers = await User.find({
            $and : [
                {
                    _id : {$ne : currentUserId}
                },
                {
                    _id : {$nin : currentUser.friends}
                },
                {
                    isOnboarded : true
                }
            ]
        })

        res.status(200).json({
            status : 200,
            data : {
                users : recommendedUsers
            }
        })
    }

    catch(e){
        return res.status(500).json({
            status : 500,
            message : `Internal Server Error : ${e.message}`
        })
    }
}

export async function getMyFriends(req : RequestWithUser, res : express.Response) {
    try{
        const user = await User.findById(req.user._id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json({
            status : 200,
            data : {
                friends : user?.friends
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

export async function sendFriendRequest(req: RequestWithUser, res: express.Response) {
    try {
        const myId = req.user._id
        const { id } = req.params

        if (Array.isArray(id)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid recipient ID"
            })
        }

        const recipientId = id

        if (myId.toString() === recipientId) {
            return res.status(400).json({
                status: 400,
                message: "You cannot send a friend request to yourself"
            })
        }

        const recipient = await User.findById(recipientId)
        if (!recipient) {
            return res.status(404).json({
                status: 404,
                message: "Recipient not found"
            })
        }

        if (recipient.friends.some(id => id.equals(myId))) {
            return res.status(409).json({
                status: 409,
                message: "You are already friends with this user"
            })
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ],
            status: { $in: ["pending", "accepted"] }
        })

        if (existingRequest) {
            return res.status(409).json({
                status: 409,
                message: "Friend request already exists"
            })
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        })

        return res.status(201).json({
            status: 201,
            data: friendRequest
        })

    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: `Internal Server Error: ${e.message}`
        })
    }
}

export async function acceptFriendRequest(req : RequestWithUser, res : express.Response) {

    try{
        const {id : requestId} = req.params

        console.log(`Friend request id : ${requestId}`)

        const friendRequest = await FriendRequest.findById(requestId)

        if(!friendRequest){
            return res.status(404).json({
                status : 404,
                message : "Friend request not found"
            })
        }

        console.log(`Friend request recipient : ${friendRequest.recipient}, Current user : ${req.user._id}`)

        if(!friendRequest.recipient.equals(req.user._id)){
            console.log("Unauthorized to accept this friend request")
            return res.status(403).json({
                status : 403,
                message : "You are not authorized to accept this friend request"
            })
        }

        friendRequest.status = "accepted"
        await friendRequest.save()

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet : {
                friends : friendRequest.recipient
            }
        })

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet : {
                friends : friendRequest.sender
            }
        })

        return res.status(200).json({
            status : 200,
            message : "Friend request accepted successfully"
        })
    }

    catch(e){
        return res.status(500).json({
            status : 500,
            message : `Internal Server Error : ${e.message}`
        })
    }
}

export async function getFriendRequests(req : RequestWithUser, res: express.Response) {
    try{
        const incomingRequests = await FriendRequest.find({
            recipient : req.user._id,
            status : "pending"
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage")

        const acceptedRequests = await FriendRequest.find({
            sender : req.user._id,
            status : "accepted"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json({
            status : 200,
            data : {
                incomingRequests,
                acceptedRequests
            }
        })
    }
    catch (e) {
        return res.status(500).json({
            status : 500 ,
            message : `Internal Server Error : ${e.message}`
        })
    }
}

export async function getOutgoingFriendRequests(req : RequestWithUser , res : express.Response){
    try{
        console.log(req.user._id)
        console.log(req.user.id)
        const outgoingRequests = await FriendRequest.find({
            sender : req.user._id,
            status : "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json({
            status : 200,
            data : outgoingRequests
        })
        
    }
    catch(e){
        return res.status(500).json({
            status : 500,
            message : `Internal Server Error : ${e.message}`
        })
    }
}
