const express = require("express");
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
dotenv.config();
app.use(express());
app.use(cors());
app.use(express.json());
const userModel = require('./Models/Register');
function connect() {
    try {
        mongoose.connect(process.env.MONGO_URL).then(() => { console.log("Database Connected Successfully!") });
    } catch (error) {
        console.log(error);
    }
};
connect();
app.post("/register", async (req, res) => {
    const { name, email, username, phone, password } = req.body;
    const emailMatch = await userModel.findOne({ email });
    if (emailMatch) {
        return res.status(400).json({
            message: "Email ID already exist!"
        })
    }
    const usernameMatch = await userModel.findOne({ username });
    if (usernameMatch) {
        return res.status(400).json({
            message: "Username is already taken!"
        })
    }
    const user = await userModel.create({
        name: name,
        email: email,
        username: username,
        phone: phone,
        password: await bcrypt.hash(password, 10)
    })
    return res.status(201).json({
        message: "Registration successfull, Please Login !"
    })
});
app.get("/login", async (req, res) => {
    const { username, password } = req.body;
    const usernameMatch = await userModel.findOne({ username });
    if (!usernameMatch) {
        return res.status(401).json({
            message: "Username not found, please register!"
        })
    };
    const userEmail = usernameMatch.email;
    const userFullName = usernameMatch.name;
    const hashedPassword = await bcrypt.hash(password, 10);
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
        return res.status(401).json({
            message: "Invalid Username / Password!"
        })
    }
    const Payload = {
        Name: userFullName,
        username: username,
        email: userEmail
    }
    const token = jwt.sign(Payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    return res.status(201).json({
        message: "Login Successful!",
        token
    })
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`);
});