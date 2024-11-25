const { verifyToken } = require("../utils/jwt");

//FUNCTION TO VALIDATE JWT TOKEN
const authenticateToken = (req, res, next) => {
  const token = req.headers["token"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decrypted = verifyToken(token);
    req.user = decrypted;
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

module.exports=authenticateToken