import User from '../models/user.model.js';
import bcrytjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import  jwt  from 'jsonwebtoken';
export const signUp = async (req, res , next) => {
    const { username, email, password } = req.body;
    const hashedpassword = bcrytjs.hashSync(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashedpassword
    });
   
    try {
        await newUser.save();
        res.status(201).json("User created succefully");

    } catch (err) {
        next(err);
    }   

};




export const signIn = async (req, res, next) => {

    const { email, password } = req.body;

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(404,"User not found! "));
        }
        const validPassword = bcrytjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(401, "Wrong Credentials! "));
        }
        const token = jwt.sign({ id: validUser.id }, process.env.JWT_SECRET);

        const {password: pass  , ...rest } = validUser._doc;

        res.cookie("access_token", token, { httpOnly: true }).
            status(200).
            json({rest });


    } catch (err) {
        next(err);
    }   

};

export const google = async (req, res, next) => {
    
    try {
       
        const user = await User.findOne({ email: req.body.email });
        
        if (user) {

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;
            res.cookie("access_token", token, { httpOnly: true }).
                status(200).
                json(rest);
            
        }
        else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedpassword = bcrytjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username:
                    req.body.name.split(" ").join("").toLowerCase() +
                    Math.random().toString(36).slice(-8),
                email: req.body.email,
                password: hashedpassword,
                avatar : req.body.photo,
            });
            await newUser.save();
            console.log("Hi iam here ", newUser);
            const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;
            res.cookie("access_token", token, { httpOnly: true }).
                status(200).
                json(rest);
        }
    
    } catch (error) {
        
        next(error);
        
    }

    

}