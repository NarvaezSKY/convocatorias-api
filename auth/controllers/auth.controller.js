import { authService } from "../services/authService.js";

// Registrar un usuario normal
export const registerUser = async (req, res) => {
  const { username, email, password, role, telefono, areaDeTrabajo, clasificacionMinCiencias, CvLAC, SemilleroInvestigacion } = req.body;
  if (!username || !email || !password || !role || !telefono) {
    return res
      .status(400)
      .json({ message: "Nombre de usuario, correo, contraseña y rol son requeridos" });
  }

  try {
    const newUser = await authService.registerUser(
      username,
      email,
      password,
      role,
      telefono,
      areaDeTrabajo,
      clasificacionMinCiencias,
      CvLAC,
      SemilleroInvestigacion
    );
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

export const registerSuperAdmin = async (req, res) => {
  const { username, email, password, adminPassword, superAdminPassword } =
    req.body;
  try {
    const newUser = await authService.registerSuperAdmin(
      username,
      email,
      password,
      adminPassword,
      superAdminPassword
    );

    if (!newUser) return res.status(403).json({ message: "Forbidden" });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Correo y contraseña son requeridos" });
  }
  try {
    const { token, userId, role, username } = await authService.login(email, password);
    res.status(200).json({ token, userId, role, username });
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
  const { id } = req.params;
  try {
    const user = await authService.getSingleUser(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
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
export const updateRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    const user = await authService.updateProfile(userId, newRole);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  const { userId, newStatus } = req.body;

  try {
    const user = await authService.updateStatus(userId, newStatus);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyToken = async (req, res) => {
  const headers = req.headers["authorization"];
  const token = headers.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }
  try {
    const user = authService.verifyToken(token);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyActivationToken = async (req, res) => {
  const { token } = req.params;
  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const user = authService.verifyActivationToken(token);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User activated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "El correo es requerido" });
  }

  try {
    await authService.forgotPassword(email);
    res.status(200).json({
      message: "Se ha enviado un correo para restablecer la contraseña",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "El token y la nueva contraseña son requeridos" });
  }

  try {
    await authService.resetPassword(token, newPassword);
    res
      .status(200)
      .json({ message: "La contraseña se ha restablecido correctamente" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFilteredUsers = async (req, res) => {
  try {
    const users = await authService.filterUsers(req.query);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    const updatedUser = await authService.updateUser(id, updates);
    res.json(updatedUser);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
