require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Modelos
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Permission = require('./src/models/Permission');
const Direccion = require('./src/models/Direccion');
const Departamento = require('./src/models/Departamento');

const seedData = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await User.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});
    await Direccion.deleteMany({});
    await Departamento.deleteMany({});
    console.log('🧹 Datos anteriores eliminados');

    // 1. Crear permisos
    const permissions = [
      // Usuarios
      { action: 'create', resource: 'usuarios', descripcion: 'Crear usuarios' },
      { action: 'read', resource: 'usuarios', descripcion: 'Ver usuarios' },
      {
        action: 'update',
        resource: 'usuarios',
        descripcion: 'Editar usuarios',
      },
      {
        action: 'delete',
        resource: 'usuarios',
        descripcion: 'Eliminar usuarios',
      },

      // Roles
      { action: 'create', resource: 'roles', descripcion: 'Crear roles' },
      { action: 'read', resource: 'roles', descripcion: 'Ver roles' },
      { action: 'update', resource: 'roles', descripcion: 'Editar roles' },
      { action: 'delete', resource: 'roles', descripcion: 'Eliminar roles' },

      // Tareas
      { action: 'create', resource: 'tareas', descripcion: 'Crear tareas' },
      { action: 'read', resource: 'tareas', descripcion: 'Ver tareas' },
      { action: 'update', resource: 'tareas', descripcion: 'Editar tareas' },
      { action: 'delete', resource: 'tareas', descripcion: 'Eliminar tareas' },

      // Departamentos
      {
        action: 'create',
        resource: 'departamentos',
        descripcion: 'Crear departamentos',
      },
      {
        action: 'read',
        resource: 'departamentos',
        descripcion: 'Ver departamentos',
      },
      {
        action: 'update',
        resource: 'departamentos',
        descripcion: 'Editar departamentos',
      },
      {
        action: 'delete',
        resource: 'departamentos',
        descripcion: 'Eliminar departamentos',
      },

      // Archivos
      { action: 'create', resource: 'archivos', descripcion: 'Subir archivos' },
      { action: 'read', resource: 'archivos', descripcion: 'Ver archivos' },
      {
        action: 'delete',
        resource: 'archivos',
        descripcion: 'Eliminar archivos',
      },

      // Reportes
      { action: 'read', resource: 'reportes', descripcion: 'Ver reportes' },
      {
        action: 'create',
        resource: 'reportes',
        descripcion: 'Exportar reportes',
      },
    ];

    const createdPermissions = await Permission.insertMany(permissions);
    console.log(`✅ ${createdPermissions.length} permisos creados`);

    // 2. Crear roles
    const adminRole = await Role.create({
      name: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      permissionIds: createdPermissions.map((p) => p._id),
      activo: true,
    });

    const supervisorRole = await Role.create({
      name: 'Supervisor',
      descripcion: 'Supervisión de tareas y usuarios',
      permissionIds: createdPermissions
        .filter((p) => p.action !== 'delete' && p.resource !== 'roles')
        .map((p) => p._id),
      activo: true,
    });

    const empleadoRole = await Role.create({
      name: 'Empleado',
      descripcion: 'Usuario básico del sistema',
      permissionIds: createdPermissions
        .filter(
          (p) =>
            p.action === 'read' ||
            (p.resource === 'tareas' &&
              (p.action === 'create' || p.action === 'update'))
        )
        .map((p) => p._id),
      activo: true,
    });

    console.log('✅ Roles creados: Administrador, Supervisor, Empleado');

    // 3. Crear direcciones
    const direcciones = [
      {
        name: 'Dirección de Administración',
      },
      {
        name: 'Dirección de Finanzas',
      },
      {
        name: 'Dirección de Obras Públicas',
      },
      {
        name: 'Dirección de Recursos Humanos',
      },
    ];

    const createdDirecciones = await Direccion.insertMany(direcciones);
    console.log(`✅ ${createdDirecciones.length} direcciones creadas`);

    // 4. Crear departamentos
    const departamentos = [
      {
        name: 'Sistemas',
        direccionId: createdDirecciones[0]._id,
      },
      {
        name: 'Contabilidad',
        direccionId: createdDirecciones[1]._id,
      },
      {
        name: 'Obras',
        direccionId: createdDirecciones[2]._id,
      },
      {
        name: 'Talento Humano',
        direccionId: createdDirecciones[3]._id,
      },
    ];

    const createdDepartamentos = await Departamento.insertMany(departamentos);
    console.log(`✅ ${createdDepartamentos.length} departamentos creados`);

    // 5. Crear usuarios iniciales
    const saltRounds = 10;

    // Usuario Administrador
    const adminUser = await User.create({
      name: 'Administrador Sistema',
      email: 'admin@jaramijo.gob.ec',
      passwordHash: await bcrypt.hash('admin123', saltRounds),
      departamentoId: createdDepartamentos[0]._id,
      roleIds: [adminRole._id],
      active: true,
    });

    // Usuario Supervisor
    const supervisorUser = await User.create({
      name: 'María González',
      email: 'supervisor@jaramijo.gob.ec',
      passwordHash: await bcrypt.hash('super123', saltRounds),
      departamentoId: createdDepartamentos[1]._id,
      roleIds: [supervisorRole._id],
      active: true,
    });

    // Usuario Empleado
    const empleadoUser = await User.create({
      name: 'Carlos López',
      email: 'empleado@jaramijo.gob.ec',
      passwordHash: await bcrypt.hash('emp123', saltRounds),
      departamentoId: createdDepartamentos[2]._id,
      roleIds: [empleadoRole._id],
      active: true,
    });

    console.log('✅ Usuarios creados exitosamente');
    console.log('\n🔑 CREDENCIALES DE ACCESO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ADMINISTRADOR:');
    console.log('   Email: admin@jaramijo.gob.ec');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 SUPERVISOR:');
    console.log('   Email: supervisor@jaramijo.gob.ec');
    console.log('   Password: super123');
    console.log('');
    console.log('👤 EMPLEADO:');
    console.log('   Email: empleado@jaramijo.gob.ec');
    console.log('   Password: emp123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    console.log('🎉 Datos iniciales creados exitosamente!');
  } catch (error) {
    console.error('❌ Error al crear datos iniciales:', error);
    process.exit(1);
  }
};

// Ejecutar seeder
seedData();
