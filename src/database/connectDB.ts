import mongoose from "mongoose";

export async function connectToMongoDB(uri : string){
    try{
        await mongoose.connect(uri);
        console.log("✅ DB connected");
    }
    catch(e){
        console.log(e)
    }
}