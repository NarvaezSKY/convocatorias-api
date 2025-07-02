import express from "express";
import {
  registerUser,
  // registerAdmin,
  login,
  getUsers,
  getSingleUser,
  profile,
  // registerSuperAdmin,
  verifyToken as verifyTokenController,
  updateRole,
  updateStatus,
} from "../controllers/auth.controller.js";
import { verifyRole } from "../../shared/middlewares/verifyRole.js";
import { verifyToken } from "../../shared/middlewares/verifyToken.js";
import { SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE } from "../../config/token.js";

const router = express.Router();

router.post("/register/user", registerUser);
// router.post("/register/admin", registerAdmin);
// router.post(
//   "/register/superadmin",
//   verifyToken,
//   verifyRole(ADMIN_ROLE),
//   registerSuperAdmin
// );
router.get("/verify", verifyToken, verifyTokenController);

router.post("/login", login);

router.get("/users", verifyToken, verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE]), getUsers);
router.get(
  "/user/:username",
  verifyToken,
  verifyRole(SUPER_ADMIN_ROLE),
  getSingleUser
);
router.get("/profile", verifyToken, profile);

router.patch("/update-role", verifyToken, verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE]), updateRole
);

router.patch("/update-status", verifyToken, verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE]), updateStatus);

export default router;
