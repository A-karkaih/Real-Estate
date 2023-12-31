import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import cookieParser from "cookie-parser";
import listingRouter from './routes/listing.route.js';
import path from 'path';
dotenv.config();

const app = express();

app.use(cookieParser());

app.use(express.json());

mongoose.connect(process.env.MONGO).then(() => {
    console.log('Connected to MongodDb')
}).catch((err) => {
    console.log(err)
});
const __dirname = path.resolve();





app.use('/api/user', userRouter);

app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internale Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000!");
});