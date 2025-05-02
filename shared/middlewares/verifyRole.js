import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../../config/token.js";

export const verifyRole = (requiredRole) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "Token is required" });
    }

    jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }

      req.user = decoded;

      if (requiredRole && req.user.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: "Access forbidden: Insufficient role" });
      }

      next();
    });
  };
};
