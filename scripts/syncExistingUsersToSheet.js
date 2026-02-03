import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { addUserToSheet } from '../auth/sheets/googleSheetsUsers.service.js';

const MONGODB_URI = process.env.MONGODB_URI;

const syncExistingUsers = async () => {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conexión exitosa a MongoDB\n');

        console.log('📥 Obteniendo usuarios de la base de datos...');
        const users = await User.find({});
        console.log(`✅ ${users.length} usuarios encontrados\n`);

        if (users.length === 0) {
            console.log('⚠️  No hay usuarios para sincronizar');
            await mongoose.connection.close();
            return;
        }

        console.log('📤 Iniciando sincronización con Google Sheets...\n');
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            try {
                console.log(`[${i + 1}/${users.length}] Sincronizando: ${user.username} (${user.email})`);
                await addUserToSheet(user);
                successCount++;
                console.log(`✅ Usuario ${user.username} sincronizado exitosamente\n`);
            } catch (error) {
                errorCount++;
                const errorInfo = {
                    user: user.username,
                    email: user.email,
                    error: error.message
                };
                errors.push(errorInfo);
                console.error(`❌ Error al sincronizar ${user.username}:`, error.message);
                console.error('   Continuando con el siguiente usuario...\n');
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('📊 RESUMEN DE SINCRONIZACIÓN');
        console.log('═══════════════════════════════════════');
        console.log(`✅ Exitosos: ${successCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📝 Total procesados: ${users.length}`);
        console.log('═══════════════════════════════════════\n');

        if (errors.length > 0) {
            console.log('❌ USUARIOS CON ERRORES:');
            errors.forEach((err, index) => {
                console.log(`   ${index + 1}. ${err.user} (${err.email})`);
                console.log(`      Error: ${err.error}\n`);
            });
        }

        console.log('🔌 Cerrando conexión a MongoDB...');
        await mongoose.connection.close();
        console.log('✅ Proceso completado\n');

    } catch (error) {
        console.error('💥 Error fatal en el proceso de sincronización:');
        console.error(error);
        
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Ejecutar el script
console.log('\n╔═══════════════════════════════════════════════════╗');
console.log('║  SINCRONIZACIÓN DE USUARIOS EXISTENTES A SHEETS  ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

syncExistingUsers();
