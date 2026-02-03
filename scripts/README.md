# Script de Sincronización de Usuarios

Este script sincroniza todos los usuarios existentes en la base de datos MongoDB con Google Sheets.

## 📋 Descripción

Inserta en Google Sheets todos los usuarios que fueron creados **antes** de implementar la sincronización automática.

## 🚀 Cómo ejecutar

### Opción 1: Con npm/yarn
```bash
yarn sync-users
```

o

```bash
npm run sync-users
```

### Opción 2: Directamente con Node
```bash
node scripts/syncExistingUsersToSheet.js
```

## ⚠️ Importante

- **Asegúrate de que el servidor NO esté corriendo** para evitar conflictos de conexión a MongoDB
- **Verifica que la hoja "Users" exista** en Google Sheets con los encabezados correctos
- **No ejecutes el script múltiples veces** o duplicarás los usuarios en el sheet

## 📊 Qué hace el script

1. ✅ Se conecta a MongoDB
2. ✅ Obtiene todos los usuarios de la base de datos
3. ✅ Por cada usuario, lo agrega a Google Sheets
4. ✅ Muestra progreso en tiempo real
5. ✅ Genera un resumen al final con:
   - Usuarios sincronizados exitosamente
   - Errores encontrados
   - Total procesado

## 🔍 Ejemplo de salida

```
╔═══════════════════════════════════════════════════╗
║  SINCRONIZACIÓN DE USUARIOS EXISTENTES A SHEETS  ║
╚═══════════════════════════════════════════════════╝

🔌 Conectando a MongoDB...
✅ Conexión exitosa a MongoDB

📥 Obteniendo usuarios de la base de datos...
✅ 25 usuarios encontrados

📤 Iniciando sincronización con Google Sheets...

[1/25] Sincronizando: Juan Pérez (juan@example.com)
📝 Agregando usuario a Google Sheets: 674abc...
✅ Usuario agregado exitosamente a Google Sheets
✅ Usuario Juan Pérez sincronizado exitosamente

[2/25] Sincronizando: María García (maria@example.com)
...

═══════════════════════════════════════
📊 RESUMEN DE SINCRONIZACIÓN
═══════════════════════════════════════
✅ Exitosos: 25
❌ Errores: 0
📝 Total procesados: 25
═══════════════════════════════════════

🔌 Cerrando conexión a MongoDB...
✅ Proceso completado
```

## 🛠️ Troubleshooting

### Error: "Cannot find module"
Asegúrate de que todas las dependencias estén instaladas:
```bash
yarn install
```

### Error: "Connection refused"
- Verifica que MongoDB esté accesible
- Revisa la variable `MONGODB_URI` en tu archivo `.env`

### Error: "Sheet name not found"
- Verifica que la hoja "Users" exista en tu Google Spreadsheet
- Confirma que `SHEET_NAME_USERS` en `.env` sea exactamente "Users"

### Usuarios duplicados
Si ejecutaste el script por error varias veces, puedes:
1. Eliminar manualmente las filas duplicadas en Google Sheets
2. O borrar toda la hoja "Users" (excepto los encabezados) y ejecutar el script nuevamente

## 📝 Notas

- El script **NO modifica** la base de datos MongoDB
- Solo **agrega** usuarios al sheet, no actualiza ni elimina
- Es seguro ejecutarlo múltiples veces si el sheet está vacío
- Los usuarios futuros se sincronizarán automáticamente
