import {StreamChat, UserResponse} from "stream-chat";
import dotenv from "dotenv";

dotenv.config()

const apiKey = process.env.STREAM_API_KEY as string
const apiSecret = process.env.STREAM_API_SECRET as string

if(!apiKey || !apiSecret){
    console.error("Stream API key or secret not found")
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret)

export const upsertStreamUser = async (userData: UserResponse) => {
    try{
        await streamClient.upsertUser(userData)
        return userData
    }
    catch (e) {
        console.error("Error upserting Stream user:", e);
    }
}

export const generateStreamToken = (userId) => {
    try {
        // ensure userId is a string
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token:", error);
    }
};