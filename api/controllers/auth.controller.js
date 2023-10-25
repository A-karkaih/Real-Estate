import User from '../models/user.model.js';
import bcrytjs from 'bcryptjs';
export const signUp = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedpassword = bcrytjs.hashSync(password, 10);
    const newUser = new  User({
        username,
        email,
        password : hashedpassword
    });
   
    try {
        await newUser.save();

    } catch (err) {
        res.status(500).json(err.message);
}

    res.status(201).json("User created succefully");

}