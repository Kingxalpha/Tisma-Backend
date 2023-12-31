const User = require("../model/User");
const Business = require("../model/Business");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const resetToken = process.env.reset_Token;
// const passport = require('passport');
// const passportJwt = require('passport-jwt');


// const secret_key = crypto.randomBytes(32).toString('hex');
// console.log(secret_key);
// 


//  REGISTER

const signUp = async (req, res) => {
  const { fullname, email, businessname, phonenumber, businessaddress, password, bvn } = req.body;
  try {
    const newUser = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    if (!newUser) {
      // User does not exist, create a new one
      const user = await User.create({
        email,
        fullname,
        phonenumber,
        businessname,
        businessaddress,
        password: hashedPassword,
        bvn
      });

      res.json({ msg: 'New User Created!!!' });
    } else {
      // User already exists
      res.status(409).json({ msg: 'User Already Exists' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// LOGIN

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json("Wrong password");
    }
    const token= jwt.sign({email,_id: user._id}, process.env.TOKEN_SECRET); 
    res.send(token);
  } catch (err) {
    res.status(500).json(err);
  }
};

// RESET PASSWORD

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex'); // Generate a random token
  return resetToken;
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      // Generate a secure and unique reset token
      const resetToken = generateResetToken();

      // Update the user document with the reset token and expiration date
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
      await user.save();

      // Send an email with the reset link
      const resetLink = `http://localhost:8000/reset-password/${resetToken}`;

      // Use Nodemailer to send the reset email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`,
      };

      await transporter.sendMail(mailOptions);

      res.json({ msg: "Password reset instructions sent to your email." });
    } else {
      res.status(404).json({ msg: "Email Not Registered" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Update Paasword


const updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // hashing password 
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};


// LOGOUT
const logoutMiddleware = (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  // Clear the token by setting it to an empty string and expiring it
  res.cookie("token", " ", { expires: new Date(0) });
  
  // Continue to the next middleware or route handler
  next();
};


const logOut = (req, res) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json("No token found");
  }
  res.cookie("token", " ", { expires: new Date(0) }).json({ message: "User successfully logged out" });
};








module.exports = {
  signUp,
  login,
  resetPassword,
  logoutMiddleware,
  logOut,
  updatePassword,
}