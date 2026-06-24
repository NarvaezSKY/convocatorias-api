import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Convocatorias API",
      version: "1.0.0",
      description: "API de gestión de convocatorias, planes financieros y casos",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["investigador", "dinamizador", "admin", "superadmin", "Linvestigador", "aprendiz", "coordinador"] },
            telefono: { type: "string" },
            estado: { type: "string", enum: ["activo", "inactivo"] },
            SENAemail: { type: "string" },
            areaDeTrabajo: { type: "string" },
            clasificacionMinCiencias: { type: "string" },
            CvLAC: { type: "string" },
            SemilleroInvestigacion: { type: "string" },
            centroDeFormacion: { type: "string" },
          },
        },
        MunicipioItem: {
          type: "object",
          required: ["municipio", "aso_org_terri"],
          properties: {
            municipio: { type: "string", maxLength: 200 },
            aso_org_terri: { type: "string", maxLength: 300 },
          },
        },
        Case: {
          type: "object",
          required: ["caso_o_sentencia", "municipios", "fecha_expedicion_requerimiento", "fecha_limite_requerimiento", "case_estado", "case_acciones"],
          properties: {
            _id: { type: "string" },
            caso_o_sentencia: { type: "string", maxLength: 200 },
            municipios: {
              type: "array",
              minItems: 1,
              items: { $ref: "#/components/schemas/MunicipioItem" },
            },
            fecha_expedicion_requerimiento: { type: "string", format: "date" },
            fecha_limite_requerimiento: { type: "string", format: "date" },
            case_estado: { type: "string", enum: ["Por atender", "En atención", "Atendido"] },
            case_acciones: { type: "string", maxLength: 500 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Convocatoria: {
          type: "object",
          properties: {
            _id: { type: "string" },
            convocatoria: { type: "string" },
            consecutivo: { type: "string" },
            direccion_oficina_regional: { type: "string" },
            tipo_postulacion: { type: "string" },
            nuevo_estado: { type: "string" },
            caso_o_sentencia: { type: "string" },
            nombre: { type: "string" },
            fecha_aprobacion: { type: "string" },
            fecha_inicio: { type: "string" },
            fecha_fin: { type: "string" },
            observaciones: { type: "string" },
            user_id: { type: "string" },
            url: { type: "string" },
            valor_solicitado: { type: "number" },
            valor_aprobado: { type: "number" },
            diferencia_presupuesto: { type: "number" },
            year: { type: "integer" },
            users: { type: "array", items: { type: "string" } },
            departamentosDeImpacto: { type: "array", items: { type: "string" } },
            municipiosDeImpacto: { type: "array", items: { type: "string" } },
            tiposPoblacionesAtendidas: { type: "array", items: { type: "string" } },
            numeroBeneficiariosDirectos: { type: "number" },
            numeroBeneficiariosIndirectos: { type: "number" },
            beneficiariosPorMunicipio: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  municipio: { type: "string" },
                  directos: { type: "number" },
                  indirectos: { type: "number" },
                },
              },
            },
            programasRelacionados: { type: "array", items: { type: "string" } },
          },
        },
        PlanFinanciero: {
          type: "object",
          properties: {
            _id: { type: "string" },
            convocatoria: { type: "string" },
            metadata: {
              type: "object",
              properties: {
                rows: { type: "integer" },
                columns: { type: "integer" },
                totalExecutionPercentage: { type: "number" },
              },
            },
            structure: {
              type: "object",
              properties: {
                rows: { type: "array", items: { type: "string" } },
                columns: { type: "array", items: { type: "string" } },
              },
            },
            data: { type: "object" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: [
    "./auth/routes/*.routes.js",
    "./convocatorias/routes/*.routes.js",
    "./planFinanciero/routes/*.routes.js",
    "./atencionEspecialJudicial/routes/*.routes.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
