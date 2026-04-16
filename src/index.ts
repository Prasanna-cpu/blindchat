
import express from "express"
import dotenv from "dotenv"
import {connectToMongoDB} from "./database/connectDB";
import authRouter from "./routes/auth.route";
import {timeOutMiddleware} from "./middleware/timeoutMiddleware";
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.route";
import chatRouter from "./routes/chat.routes";
import cors from "cors"
import {protectedRoute} from "./middleware/authentication";

dotenv.config()

const port = process.env.PORT
const uri = process.env.MONGO_URI as string

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(timeOutMiddleware(30000))
app.use(cookieParser())
app.use(cors({
    origin : "http://localhost:2000",
    credentials : true
}))


app.get("/", (req, res) => {
    res.json("Hi")
})

app.use("/auth",authRouter)
app.use("/api/users",protectedRoute,userRouter)
app.use("/api/chats",protectedRoute,chatRouter)


async function startServer() {
    await connectToMongoDB(uri);

    app.listen(port, () => {
        console.info(`Server initiated at http://localhost:${port}`);
    });
}

startServer().then(r => console.info("promise"));