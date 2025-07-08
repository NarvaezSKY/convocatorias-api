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
} from "../controllers/auth.controller.js";
import { verifyRole } from "../../shared/middlewares/verifyRole.js";
import { verifyToken } from "../../shared/middlewares/verifyToken.js";
import {
  SUPER_ADMIN_ROLE,
  DINAMIZADOR_ROLE,
  LINVESTIGADOR_ROLE,
} from "../../config/token.js";

const router = express.Router();

router.post("/register/user", registerUser);
router.get("/verify", verifyToken, verifyTokenController);

router.post("/login", login);

router.get(
  "/users",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE]),
  getUsers
);
router.get(
  "/user/:username",
  verifyToken,
  verifyRole(SUPER_ADMIN_ROLE),
  getSingleUser
);
router.get("/profile", verifyToken, profile);

router.patch(
  "/update-role",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE]),
  updateRole
);

router.get(
  "/activate/:token",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE]),
  verifyActivationToken
);

router.post("/recover-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.patch(
  "/update-status",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE]),
  updateStatus
);

router.get(
  "/filter-users",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, LINVESTIGADOR_ROLE]),
  getFilteredUsers
);

export default router;
