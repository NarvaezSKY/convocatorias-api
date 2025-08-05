/* eslint-disable no-unused-vars */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";
import {
  TOKEN_SECRET,
  ADMIN_PASSWORD,
  ADMIN_ROLE,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_ROLE,
  USER_ROLE,
  GOOGLE_CLIENT_EMAIL,
  GOOGLE_EMAIL_PASSWORD,
  FRONTEND_DEV_URL,
  FRONTEND_PROD_URL,
} from "../../config/token.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { generateActivationToken } from "../../utils/generateActivationToken.js";
import { verifyActivationToken as activateUser } from "../../utils/generateActivationToken.js";

dotenv.config();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const authService = {
  sendActivationRequestEmail: async (user, token) => {
    const adminEmail = GOOGLE_CLIENT_EMAIL;
    const activationUrl = `${FRONTEND_PROD_URL}/admin/activate/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GOOGLE_CLIENT_EMAIL,
        pass: GOOGLE_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Sistema de Registro" <${GOOGLE_CLIENT_EMAIL}>`,
      to: adminEmail,
      subject: "Nueva solicitud de registro",
      html: `
       
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <!-- Container principal -->
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header con logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px 40px; text-align: center;">
                            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vYwiWubYsdjXt5KVWQXVbUcUqG5oDB.png" alt="SENA - Innovación y Competitividad" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
                        </td>
                    </tr>
                    
                    <!-- Contenido principal -->
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">
                                Solicitud de Activación de Cuenta
                            </h1>
                            
                            <div style="background-color: #f8f9fa; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                                    El usuario <strong style="color: #333333;">${user.username}</strong> (${user.email}, ${user.telefono}, ${user.role}) solicita activar su cuenta.
                                </p>                                
                                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0;">
                                    Haz clic en el siguiente botón para activarlo:
                                </p>
                            </div>
                            
                            <!-- Botón de activación -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${activationUrl}" 
                                   style="display: inline-block; 
                                          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                                          color: white; 
                                          padding: 15px 30px; 
                                          text-decoration: none; 
                                          border-radius: 6px; 
                                          font-weight: 600; 
                                          font-size: 16px; 
                                          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                                          transition: all 0.3s ease;">
                                    ✓ Activar Usuario
                                </a>
                            </div>
                            
                            <!-- Información adicional -->
                            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
                                <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
                                    <strong>Nota:</strong> Este enlace expirará en 24 horas por seguridad.
                                </p>
                            </div>
                            
                            <!-- Enlace alternativo -->
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                                    Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:
                                </p>
                                <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #333333; margin: 10px 0 0 0;">
                                    ${activationUrl}
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                                SENA - Servicio Nacional de Aprendizaje
                            </p>
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                Este es un correo automático, por favor no responder a este mensaje.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Espaciado inferior -->
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                        © 2025 SENA. Todos los derechos reservados.
                    </p>
                </div>
            </td>
        </tr>
    </table>
</body>
    `,
    };

    await transporter.sendMail(mailOptions);
  },

  registerUser: async (username, email, password, role, telefono, areaDeTrabajo, clasificacionMinCiencias, CvLAC, SemilleroInvestigacion) => {
    const existingUser = await User.findOne({ username });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("El correo electrónico ya está en uso");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      telefono,
      estado: "inactivo",
      areaDeTrabajo,
      clasificacionMinCiencias,
      CvLAC,
      SemilleroInvestigacion
    });

    await newUser.save();

    const token = generateActivationToken(newUser._id.toString());

    await authService.sendActivationRequestEmail(newUser, token);

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

  updateStatus: async (userId, newStatus) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.estado = newStatus;
    await user.save();
    return user;
  },

  registerSuperAdmin: async (
    username,
    email,
    password,
    adminPassword,
    superAdminPassword
  ) => {
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

  login: async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Credenciales incorrectas");
    }

    if (user.estado === "inactivo") {
      console.log(user.estado);
      throw new Error(
        "Tu cuenta está inactiva. Por favor, contacta al administrador."
      );
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

  getSingleUser: async (_id) => {
    const user = await User.findOne({ _id });
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
        username: decoded.username,
      };
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  },

  filterUsers: async (filters) => {
    const query = {};

    for (const key in filters) {
      if (filters[key]) {
        if (key === "estado" || key === "role") {
          query[key] = { $eq: filters[key] };
        } else {
          query[key] = { $regex: filters[key], $options: "i" };
        }
      }
    }

    return await User.find(query);
  },

  verifyActivationToken: async (token) => {
    try {
      const decoded = activateUser(token);
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.estado = "activo";
      await user.save();
      return user;
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  },

  forgotPassword: async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    const token = generateActivationToken(user._id.toString());
    await authService.sendPasswordResetEmail(user, token);
  },

  sendPasswordResetEmail: async (user, token) => {
    const resetUrl = `${FRONTEND_PROD_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GOOGLE_CLIENT_EMAIL,
        pass: GOOGLE_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Sistema de Registro" <${GOOGLE_CLIENT_EMAIL}>`,
      to: user.email,
      subject: "Restablecimiento de contraseña",
      html: `
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px 40px; text-align: center;">
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vYwiWubYsdjXt5KVWQXVbUcUqG5oDB.png" alt="SENA - Innovación y Competitividad" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">
                Restablecimiento de Contraseña
              </h1>
              <div style="background-color: #f8f9fa; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                  Hola <strong style="color: #333333;">${user.username}</strong>, has solicitado restablecer tu contraseña.
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0;">
                  Haz clic en el siguiente botón para cambiar tu contraseña:
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                  style="display: inline-block; 
                        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: 600; 
                        font-size: 16px; 
                        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                        transition: all 0.3s ease;">
                  Cambiar Contraseña
                </a>
              </div>
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
                  <strong>Nota:</strong> Este enlace expirará en 24 horas por seguridad.
                </p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                  Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:
                </p>
                <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #333333; margin: 10px 0 0 0;">
                  ${resetUrl}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                SENA - Servicio Nacional de Aprendizaje
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Este es un correo automático, por favor no responder a este mensaje.
              </p>
            </td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            © 2025 SENA. Todos los derechos reservados.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
    `,
    };

    await transporter.sendMail(mailOptions);
  },

  resetPassword: async (token, newPassword) => {
    try {
      const decoded = activateUser(token);
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error("User not found");
      }
      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      await user.save();
      return user;
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  },

  updateUser: async (userId, updates) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("No se encontró al usuario");
    }
    Object.assign(user, updates);
    await user.save();
    return user;
  },
};
