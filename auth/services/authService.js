import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";
import { TOKEN_SECRET, ADMIN_PASSWORD } from "../../config/token.js";
import dotenv from "dotenv";
dotenv.config();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const authService = {
  // Registro de usuario normal
  registerUser: async (username, email, password) => {
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });
    return newUser;
  },

  // Registro de administrador
  registerAdmin: async (username, email, password, adminPassword) => {
    if (adminPassword !== ADMIN_PASSWORD) {
      throw new Error("Invalid admin password");
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });
    return newUser;
  },

  // Login
  login: async (username, password) => {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
  
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      TOKEN_SECRET,
      { expiresIn: "1h" }
    );
  
    return { token, userId: user.id };
  },

  // Obtener todos los usuarios (solo para administradores)
  getUsers: async () => {
    const users = await User.findAll();
    return users;
  },

  getSingleUser: async (username) => {
    const user = await User.findOne({ where: { username } });
    return user;
  },

  getProfile: async (userId) => {
    const user = await User.findByPk(userId);
    return user;
  },
};
