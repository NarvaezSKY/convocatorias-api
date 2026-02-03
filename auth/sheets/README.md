# Google Sheets - Users Sync

## Configuración de la hoja "Users"

### Encabezados (Columnas)

Asegúrate de que tu hoja de Google Sheets tenga los siguientes encabezados en la **FILA 1** en este orden:

| # | Columna | Tipo |
|---|---------|------|
| A | _id | String (MongoDB ObjectId) |
| B | username | String |
| C | email | String |
| D | role | String |
| E | telefono | String |
| F | estado | String (activo/inactivo) |
| G | SENAemail | String |
| H | areaDeTrabajo | String |
| I | clasificacionMinCiencias | String |
| J | CvLAC | String |
| K | SemilleroInvestigacion | String |
| L | centroDeFormacion | String |

### Sincronización Automática

Los usuarios se sincronizan automáticamente con Google Sheets en los siguientes eventos:

✅ **Registro de usuario** (`registerUser`)
- Se agrega una nueva fila al sheet

✅ **Activación de cuenta** (`verifyActivationToken`)
- Se actualiza el estado a "activo"

✅ **Cambio de rol** (`updateProfile`)
- Se actualiza el rol del usuario

✅ **Cambio de estado** (`updateStatus`)
- Se actualiza entre "activo" e "inactivo"

✅ **Actualización de perfil** (`updateUser`)
- Se actualizan todos los campos modificados

### Logs de Debugging

El sistema incluye logs detallados para facilitar el debugging:

- 📝 Agregando usuario a Google Sheets
- 🔄 Actualizando usuario en Google Sheets
- 📊 Filas encontradas
- 🔍 Índice de fila encontrado
- 📍 Actualizando en rango
- ✅ Operación exitosa
- ❌ Error en la operación

### Troubleshooting

Si los cambios no se reflejan en Google Sheets:

1. **Verifica la consola** del servidor para ver los logs
2. **Confirma** que el nombre de la hoja sea exactamente "Users" (case-sensitive)
3. **Revisa** que el `SHEET_NAME_USERS` en `.env` coincida con el nombre de la hoja
4. **Asegúrate** de que los encabezados estén en la fila 1
5. **Verifica** los permisos de la cuenta de servicio de Google

### Comportamiento Especial

- Si un usuario no existe en el sheet durante una actualización, se agregará automáticamente
- Si la hoja está vacía, el primer usuario se agregará correctamente
- Los campos opcionales (vacíos) se guardan como strings vacíos
