import express from "express";
import {loginSchema, signUpSchema, onboardSchema} from "../validations/auth.validations";
import User from "../models/User";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import {upsertStreamUser} from "../stream/stream";
import {RequestWithUser} from "../middleware/authentication";


const secret_key = process.env.JWT_SECRET as string


export async function signup(req : express.Request, res : express.Response){
    try{

        const {error , value} = signUpSchema.validate(req.body)

        if(error){
            return res.status(400).json({
                status: 400,
                message : error.details[0].message
            })
        }

        const {email , password , fullName} = req.body

        const existingUser = await User.findOne({email})

        if(res.headersSent) return

        if(existingUser) {
            return res.status(409).json({
                status : 409,
                message : "User already present with the above emailId"
            })
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic : randomAvatar
        })

        try{
            await upsertStreamUser({
                id : newUser._id.toString(),
                name : newUser.fullName,
                image : newUser.profilePic || ""
            })
            console.log(`Stream user created successfully for the new user ${newUser.fullName}`)
        }
        catch(error){
            return res.status(500).json(
                {
                    status : 500,
                    message : "Error creating Stream user"
                }
            )
        }

        if(res.headersSent) return

        const token = jwt.sign(
            {
                userId : newUser._id
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn : '7d'
            }
        )

        if(res.headersSent) return

        res.cookie("jwt",token,{
            maxAge : 7 * 24 * 60 * 60 * 1000,
            httpOnly : true,
            sameSite : "strict",
            secure : process.env.NODE_ENV !== "development"
        })

        const newUserObject: any = newUser.toObject();
        delete newUserObject.password;

        if(res.headersSent) return

        res.status(201).json({
            status: 201,
            data: {
                user: newUserObject
            }
        });
    }

    catch(e : any){

        if (res.headersSent) return;

        res.status(500).json({
            status: 500,
            error : e.message
        })
    }
}

export async function login(req: express.Request, res: express.Response) {
    try {
        const { error } = loginSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        });

        return res.status(200).json({
            status: 200,
            data: {
                user: {
                    "email" : user.email,
                }
            }
        });

    } catch (e: any) {
        if (res.headersSent) return;

        return res.status(500).json({
            status: 500,
            error: e.message || "Internal server error"
        });
    }
}

export function logout(req : express.Request, res: express.Response) {
    res.clearCookie("jwt")
    return res.status(200).json(
        {
            status: 200,
            message: "Logged out successfully"
        }
    )
}

export async function onboard(req : RequestWithUser, res: express.Response) {
    try{
        const userId = req.user._id

        const {error} = onboardSchema.validate(req.body)

        if(error){
            return res.status(400).json({
                status: 400,
                message : error.details[0].message
            })
        }

        const {fullName, bio, nativeLanguage, learningLanguage, location} = req.body

        const updatedUser = await User.findByIdAndUpdate(userId, {
            fullName,
            bio,
            nativeLanguage,
            learningLanguage,
            location,
            isOnboarded : true
        } , { returnDocument : "after" })

        if(!updatedUser){
            return res.status(404).json({
                status : 404,
                message : "User not found"
            })
        }

        try{
            await upsertStreamUser({
                id : updatedUser._id.toString(),
                name : updatedUser.fullName,
                image : updatedUser.profilePic || ""
            })
            console.log(`Stream user created successfully for the new user ${updatedUser.fullName}`)
        }
        catch(error){
            return res.status(500).json(
                {
                    status : 500,
                    message : "Error creating Stream user"
                }
            )
        }

        res.status(200).json({
            status : 200,
            data : {
                user : updatedUser
            }
        })

    }
    catch (e) {
        return res.status(500).json({
            status: 500,
            error: e.message || "Internal server error"
        });
    }
}