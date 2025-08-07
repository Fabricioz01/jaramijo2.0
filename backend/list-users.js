require('dotenv').config();
const mongoose = require('mongoose');

// Importar modelos
require('./src/models/User');

const User = mongoose.model('User');

async function listUsers() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('\n👥 USUARIOS EN LA BASE DE DATOS:');
    const users = await User.find({}, 'name email active createdAt')
      .sort({ email: 1 });

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      users.forEach((user, index) => {
        const status = user.active ? '✅ Activo' : '❌ Inactivo';
        console.log(`  ${index + 1}. ${user.name}`);
        console.log(`     📧 Email: ${user.email}`);
        console.log(`     📊 Estado: ${status}`);
        console.log(`     📅 Creado: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    console.log(`📊 Total de usuarios: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

listUsers();
