import 'dotenv/config';
import mongoose from 'mongoose';
import { Convocatoria } from '../models/Convocatoria.js';

const MONGODB_URI = process.env.MONGODB_URI;

// Mapa de nombres antiguos -> nuevo nombre
const MUNICIPIO_RENAMES = {
  'Purace (Cauca)': 'Puracé (Cauca)',
  'Timbio (Cauca)': 'Timbío (Cauca)',
  'Toribio (Cauca)': 'Toribío (Cauca)',
  'Totoro (Cauca)': 'Totoró (Cauca)',
  'Piendamo (Cauca)': 'Piendamó - Tunía (Cauca)',
};

const OLD_NAMES = Object.keys(MUNICIPIO_RENAMES);

const fixMunicipioNames = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB\n');

    let totalUpdated = 0;
    let totalDocsAffected = 0;

    for (const [oldName, newName] of Object.entries(MUNICIPIO_RENAMES)) {
      console.log(`\n🔍 Buscando "${oldName}" → "${newName}"`);

      // ── municipiosDeImpacto ──────────────────────────────────────────────
      const docsImpacto = await Convocatoria.find({ municipiosDeImpacto: oldName });
      if (docsImpacto.length > 0) {
        console.log(`   municipiosDeImpacto: ${docsImpacto.length} documento(s) encontrado(s)`);
        for (const doc of docsImpacto) {
          doc.municipiosDeImpacto = doc.municipiosDeImpacto.map(m =>
            m === oldName ? newName : m
          );
          await doc.save();
        }
        totalUpdated += docsImpacto.length;
        console.log(`   ✅ ${docsImpacto.length} documento(s) actualizados en municipiosDeImpacto`);
      } else {
        console.log(`   municipiosDeImpacto: sin coincidencias`);
      }

      // ── beneficiariosPorMunicipio ────────────────────────────────────────
      const docsBenef = await Convocatoria.find({ 'beneficiariosPorMunicipio.municipio': oldName });
      if (docsBenef.length > 0) {
        console.log(`   beneficiariosPorMunicipio: ${docsBenef.length} documento(s) encontrado(s)`);
        for (const doc of docsBenef) {
          doc.beneficiariosPorMunicipio = doc.beneficiariosPorMunicipio.map(b =>
            b.municipio === oldName ? { ...b.toObject(), municipio: newName } : b
          );
          await doc.save();
        }
        totalUpdated += docsBenef.length;
        console.log(`   ✅ ${docsBenef.length} documento(s) actualizados en beneficiariosPorMunicipio`);
      } else {
        console.log(`   beneficiariosPorMunicipio: sin coincidencias`);
      }

      totalDocsAffected += docsImpacto.length + docsBenef.length;
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMEN');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Total de actualizaciones realizadas: ${totalUpdated}`);
    console.log(`📝 Pares municipio procesados:          ${OLD_NAMES.length}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
};

fixMunicipioNames();
