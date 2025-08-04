const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const File = require('../models/File');
const Task = require('../models/Task');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function addFileTypeMigration() {
  try {
    console.log('🔄 Iniciando migración para agregar fileType a archivos...');

    // Obtener todas las tareas para identificar archivos de resolución
    const tasks = await Task.find({
      resolutionFileId: { $exists: true, $ne: null },
    });
    const resolutionFileIds = tasks.map((task) =>
      task.resolutionFileId.toString()
    );

    console.log(
      `📋 Encontradas ${tasks.length} tareas con archivos de resolución`
    );

    // Actualizar archivos de resolución
    const resolutionUpdateResult = await File.updateMany(
      { _id: { $in: resolutionFileIds } },
      { $set: { fileType: 'resolution' } }
    );

    console.log(
      `✅ Actualizados ${resolutionUpdateResult.modifiedCount} archivos de resolución`
    );

    // Actualizar todos los demás archivos como 'attachment'
    const attachmentUpdateResult = await File.updateMany(
      {
        _id: { $nin: resolutionFileIds },
        fileType: { $exists: false },
      },
      { $set: { fileType: 'attachment' } }
    );

      const totalFiles = await File.countDocuments();
    const attachmentFiles = await File.countDocuments({
      fileType: 'attachment',
    });
    const resolutionFiles = await File.countDocuments({
      fileType: 'resolution',
    });

    console.log(`📊 Estado final:`);
    console.log(`   Total de archivos: ${totalFiles}`);
    console.log(`   Archivos adjuntos: ${attachmentFiles}`);
    console.log(`   Archivos de resolución: ${resolutionFiles}`);

    console.log('✅ Migración completada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    return false;
  }
}

module.exports = { addFileTypeMigration };

// Si se ejecuta directamente
if (require.main === module) {
  connectDB()
    .then(async () => {
      const success = await addFileTypeMigration();
      await mongoose.connection.close();
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Error conectando a la base de datos:', error);
      process.exit(1);
    });
}
