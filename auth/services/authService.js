import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";
import {
  TOKEN_SECRET,
  ADMIN_PASSWORD,
  ADMIN_ROLE,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_ROLE,
  USER_ROLE
} from "../../config/token.js";
import dotenv from "dotenv";
dotenv.config();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const authService = {
  registerUser: async (username, email, password) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("Username already exists");
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("Email already exists");
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: USER_ROLE,
    });
    await newUser.save();
    return newUser;
  },

  updateProfile: async (userId, newRole) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.role = newRole;
    await user.save();
    return user;
  },

  registerSuperAdmin: async (username, email, password, adminPassword, superAdminPassword) => {
    if (adminPassword !== ADMIN_PASSWORD) {
      throw new Error("Invalid admin password");
    }
    if (superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Invalid super admin password");
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: SUPER_ADMIN_ROLE,
    });
    await newUser.save();
    return newUser;
  },

  registerAdmin: async (username, email, password, adminPassword) => {
    if (adminPassword !== ADMIN_PASSWORD) {
      throw new Error("Invalid admin password");
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: ADMIN_ROLE,
    });
    await newUser.save();
    return newUser;
  },

  login: async (username, password) => {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    return { token, userId: user._id, role: user.role };
  },

  getUsers: async () => {
    const users = await User.find();
    return users;
  },

  getSingleUser: async (username) => {
    const user = await User.findOne({ username });
    return user;
  },

  getProfile: async (userId) => {
    const user = await User.findById(userId);
    return user;
  },

  verifyToken: (token) => {
    try {
      const decoded = jwt.verify(token, TOKEN_SECRET);
      return {
        token,
        userId: decoded.id,
        role: decoded.role,
        username: decoded.username
      };
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  },
};
