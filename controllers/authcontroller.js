const usermodel = require("../models/usermodel");
const express = require("express");
const { generateToken } = require("../utils/jwt");
const authenticateToken = require("../middlewares/jwtguard");
const authrouter = express.Router();
const bcrypt=require("bcryptjs")





// METHOD:POST
// SIGNUP ROUTER TO CREATE A USER AND STORES IT IN DB WITH HASHING THE PASSWORD BEFORE SAVING

authrouter.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await usermodel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exist" });
    }

       const salt = await bcrypt.genSalt(10); //HASHING PASSWORD WITH BCRYPT
       const hashedpassword = await bcrypt.hash(password, salt);

      
    const newUser = new usermodel({
      name,
      email,
      password:hashedpassword,
      role,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", Error: error.message });
  }
});






// METHOD:POST
// LOGIN ROUTER TO LOGIN A USER THAT PRESENTS IN DB WITH REGISTERED MAILID AND PASSWORD
authrouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // const passwordValid = await bcrypt.compare(password, user.password); //COMPARING THE ENTERED PASSWORD WITH PASSWORD IN DB
 const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
     return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken({ id: user._id, email: user.email,role:user.role,name:user.name }); //GENERATIING TOKEN ON SUCCESSFUL LOGIN USING JWT

   res.status(200).json({
     message: "Logged in successfully",
     data: { id: user._id, email: user.email, role: user.role ,name:user.name, token },
   });
  } catch (error) {
    res
      .status(500)
      .json({ message: "something went wrong", ERROR: error.message });
  }
});





//VERIFYING JWT TOKEN

authrouter.get("/verify", authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user }); // Return the user data if the token is valid
});

module.exports = authrouter;
