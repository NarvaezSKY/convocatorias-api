import express from "express";
import {
  registerUser,
  login,
  getUsers,
  getSingleUser,
  profile,
  verifyToken as verifyTokenController,
  forgotPassword,
  updateRole,
  verifyActivationToken,
  resetPassword,
  updateStatus,
  getFilteredUsers,
  updateUser,
  changePasswordWithSession
} from "../controllers/auth.controller.js";
import { verifyRole } from "../../shared/middlewares/verifyRole.js";
import { verifyToken } from "../../shared/middlewares/verifyToken.js";
import {
  SUPER_ADMIN_ROLE,
  DINAMIZADOR_ROLE,
  LINVESTIGADOR_ROLE,
  COORDINADOR_ROLE,
} from "../../config/token.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/register/user:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, role, telefono]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string }
 *               telefono: { type: string }
 *               areaDeTrabajo: { type: string }
 *               clasificacionMinCiencias: { type: string }
 *               CvLAC: { type: string }
 *               SemilleroInvestigacion: { type: string }
 *               SENAemail: { type: string }
 *               centroDeFormacion: { type: string }
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register/user", registerUser);
/**
 * @openapi
 * /api/auth/verify:
 *   get:
 *     tags: [Auth]
 *     summary: Verificar validez del token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o expirado
 */
router.get("/verify", verifyToken, verifyTokenController);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [SENAemail, password]
 *             properties:
 *               SENAemail: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 userId: { type: string }
 *                 role: { type: string }
 *                 username: { type: string }
 *       400:
 *         description: Credenciales inválidas
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener todos los usuarios (solo roles autorizados)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 */
router.get(
  "/users",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE, COORDINADOR_ROLE]),
  getUsers
);
/**
 * @openapi
 * /api/auth/user/{id}:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener un usuario por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/user/:id",
  verifyToken,
  getSingleUser
);
/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/profile", verifyToken, profile);

/**
 * @openapi
 * /api/auth/update-role:
 *   patch:
 *     tags: [Auth]
 *     summary: Actualizar rol de un usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, newRole]
 *             properties:
 *               userId: { type: string }
 *               newRole: { type: string }
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.patch(
  "/update-role",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE]),
  updateRole
);

/**
 * @openapi
 * /api/auth/activate/{token}:
 *   get:
 *     tags: [Auth]
 *     summary: Activar usuario mediante token
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario activado
 *       400:
 *         description: Token inválido
 */
router.get(
  "/activate/:token",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE]),
  verifyActivationToken
);

/**
 * @openapi
 * /api/auth/recover-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar recuperación de contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 *       400:
 *         description: Email requerido
 */
router.post("/recover-password", forgotPassword);
/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Restablecer contraseña con token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Contraseña restablecida
 *       400:
 *         description: Token o contraseña inválidos
 */
router.post("/reset-password", resetPassword);

/**
 * @openapi
 * /api/auth/update-status:
 *   patch:
 *     tags: [Auth]
 *     summary: Actualizar estado de un usuario (activo/inactivo)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, newStatus]
 *             properties:
 *               userId: { type: string }
 *               newStatus: { type: string, enum: [activo, inactivo] }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Error de validación
 */
router.patch(
  "/update-status",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE]),
  updateStatus
);

/**
 * @openapi
 * /api/auth/filter-users:
 *   get:
 *     tags: [Auth]
 *     summary: Filtrar usuarios por query params
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *       - in: query
 *         name: estado
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuarios filtrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get(
  "/filter-users",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE, COORDINADOR_ROLE]),
  getFilteredUsers
);

/**
 * @openapi
 * /api/auth/update-user:
 *   patch:
 *     tags: [Auth]
 *     summary: Actualizar datos del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               username: { type: string }
 *               telefono: { type: string }
 *               areaDeTrabajo: { type: string }
 *               clasificacionMinCiencias: { type: string }
 *               CvLAC: { type: string }
 *               SemilleroInvestigacion: { type: string }
 *               centroDeFormacion: { type: string }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 */
router.patch(
  "/update-user",
  verifyToken,
  updateUser
);

/**
 * @openapi
 * /api/auth/change-password-session:
 *   patch:
 *     tags: [Auth]
 *     summary: Cambiar contraseña con sesión activa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Contraseña cambiada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.patch(
  "/change-password-session",
  verifyToken,
  changePasswordWithSession
);

export default router;
