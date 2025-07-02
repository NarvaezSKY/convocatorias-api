import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config/token.js";

export const generateActivationToken = (userId) => {
  return jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: "2d" });
};

export const verifyActivationToken = (token) => {
  return jwt.verify(token, TOKEN_SECRET);
};
