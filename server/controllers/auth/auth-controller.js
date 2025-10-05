const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // switch to true if using HTTPS in production
        sameSite: "lax", // important for sending cookies on navigation
        path: "/", // cookie accessible on all routes
        maxAge: 60 * 60 * 1000, // cookie expires in 1 hour (matches JWT expiration)
      })
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          email: checkUser.email,
          role: checkUser.role,
          id: checkUser._id,
          userName: checkUser.userName,
        },
      });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/public",
    "/api/home"      // Example public routes
  ];

  // Skip authentication for public routes
  if (publicRoutes.includes(req.originalUrl)) {
    return next();
  }

  const token = req.cookies.token; // Get token from cookies

  // If no token found, respond with unauthorized error
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized! No token provided."
    });
  }

  try {
    // Verify the token and attach user info to request
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded; // Attach the decoded user data
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized! Invalid or expired token."
    });
  }
};



module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
