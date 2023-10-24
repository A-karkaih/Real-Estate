import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true ,
    },
    emial: {
        type: String,
        required: true,
        unique: true,
    },
    pasword: {
        type: String,
        required: true,
        
    },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

export default User;
