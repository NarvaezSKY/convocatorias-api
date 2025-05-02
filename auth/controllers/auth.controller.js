import { authService } from "../services/authService.js";

// Registrar un usuario normal
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await authService.registerUser(username, email, password);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Registrar un administrador (solo si el adminPassword es correcto)
export const registerAdmin = async (req, res) => {
  const { username, email, password, adminPassword } = req.body;
  try {
    const newUser = await authService.registerAdmin(
      username,
      email,
      password,
      adminPassword
    );

    if (!newUser) return res.status(403).json({ message: "Forbidden" });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { token, userId } = await authService.login(username, password);
    res.status(200).json({ token, userId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtener todos los usuarios (solo administradores)
export const getUsers = async (req, res) => {
  try {
    const users = await authService.getUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener un usuario específico por username
export const getSingleUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await authService.getSingleUser(username);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener el perfil del usuario
export const profile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar el perfil del usuario
export const updateProfile = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await authService.updateProfile(
      req.user.id,
      username,
      email,
      password
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
