import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Datos existentes eliminados');

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('123456', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cpfp6.edu.ar',
      password: hashedPassword,
      name: 'Administrador CPFP',
      role: 'ADMIN'
    }
  });

  const profesor1 = await prisma.user.create({
    data: {
      email: 'profesor1@cpfp6.edu.ar',
      password: hashedPassword,
      name: 'María García',
      role: 'PROFESOR'
    }
  });

  const profesor2 = await prisma.user.create({
    data: {
      email: 'profesor2@cpfp6.edu.ar',
      password: hashedPassword,
      name: 'Juan Pérez',
      role: 'PROFESOR'
    }
  });

  console.log('👥 Usuarios creados');

  // Crear cursos
  const curso1 = await prisma.course.create({
    data: {
      name: 'Programación Web',
      description: 'Curso de desarrollo web con HTML, CSS y JavaScript',
      year: 2024,
      division: 'A',
      teacherId: profesor1.id
    }
  });

  const curso2 = await prisma.course.create({
    data: {
      name: 'Base de Datos',
      description: 'Fundamentos de bases de datos relacionales',
      year: 2024,
      division: 'B',
      teacherId: profesor2.id
    }
  });

  const curso3 = await prisma.course.create({
    data: {
      name: 'Redes y Comunicaciones',
      description: 'Conceptos de redes de computadoras',
      year: 2024,
      division: 'A',
      teacherId: profesor1.id
    }
  });

  console.log('📚 Cursos creados');

  // Crear estudiantes
  const estudiantes = [
    {
      dni: '12345678',
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@email.com',
      phone: '1234567890',
      birthDate: new Date('2000-03-15')
    },
    {
      dni: '23456789',
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos.lopez@email.com',
      phone: '2345678901',
      birthDate: new Date('1999-07-22')
    },
    {
      dni: '34567890',
      firstName: 'Lucía',
      lastName: 'Rodríguez',
      email: 'lucia.rodriguez@email.com',
      phone: '3456789012',
      birthDate: new Date('2001-01-10')
    },
    {
      dni: '45678901',
      firstName: 'Diego',
      lastName: 'Fernández',
      email: 'diego.fernandez@email.com',
      phone: '4567890123',
      birthDate: new Date('2000-11-05')
    },
    {
      dni: '56789012',
      firstName: 'Sofía',
      lastName: 'González',
      email: 'sofia.gonzalez@email.com',
      phone: '5678901234',
      birthDate: new Date('1999-09-18')
    },
    {
      dni: '67890123',
      firstName: 'Mateo',
      lastName: 'Silva',
      email: 'mateo.silva@email.com',
      phone: '6789012345',
      birthDate: new Date('2001-04-30')
    }
  ];

  const estudiantesCreados = [];
  for (const estudiante of estudiantes) {
    const created = await prisma.student.create({
      data: estudiante
    });
    estudiantesCreados.push(created);
  }

  console.log('🎓 Estudiantes creados');

  // Crear inscripciones
  const inscripciones = [
    // Curso 1 - Programación Web
    { studentId: estudiantesCreados[0].id, courseId: curso1.id },
    { studentId: estudiantesCreados[1].id, courseId: curso1.id },
    { studentId: estudiantesCreados[2].id, courseId: curso1.id },
    { studentId: estudiantesCreados[3].id, courseId: curso1.id },
    
    // Curso 2 - Base de Datos
    { studentId: estudiantesCreados[2].id, courseId: curso2.id },
    { studentId: estudiantesCreados[3].id, courseId: curso2.id },
    { studentId: estudiantesCreados[4].id, courseId: curso2.id },
    { studentId: estudiantesCreados[5].id, courseId: curso2.id },
    
    // Curso 3 - Redes
    { studentId: estudiantesCreados[0].id, courseId: curso3.id },
    { studentId: estudiantesCreados[4].id, courseId: curso3.id },
    { studentId: estudiantesCreados[5].id, courseId: curso3.id }
  ];

  for (const inscripcion of inscripciones) {
    await prisma.enrollment.create({
      data: inscripcion
    });
  }

  console.log('📝 Inscripciones creadas');

  // Crear asistencias de ejemplo (últimos 7 días)
  const fechas = [];
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    fechas.push(fecha);
  }

  const estados = ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'];
  
  for (const inscripcion of inscripciones) {
    for (const fecha of fechas) {
      // No crear asistencia todos los días (simular realidad)
      if (Math.random() > 0.3) {
        const estado = estados[Math.floor(Math.random() * estados.length)];
        // Más probabilidad de estar presente
        const estadoFinal = Math.random() > 0.2 ? 'PRESENTE' : estado;
        
        await prisma.attendance.create({
          data: {
            studentId: inscripcion.studentId,
            courseId: inscripcion.courseId,
            date: fecha,
            status: estadoFinal,
            notes: estadoFinal === 'JUSTIFICADO' ? 'Justificación médica' : null
          }
        });
      }
    }
  }

  console.log('📅 Asistencias creadas');

  // Mostrar resumen
  const totalUsers = await prisma.user.count();
  const totalCourses = await prisma.course.count();
  const totalStudents = await prisma.student.count();
  const totalEnrollments = await prisma.enrollment.count();
  const totalAttendances = await prisma.attendance.count();

  console.log('\n✅ Seed completado exitosamente!');
  console.log('📊 Resumen:');
  console.log(`   👥 Usuarios: ${totalUsers}`);
  console.log(`   📚 Cursos: ${totalCourses}`);
  console.log(`   🎓 Estudiantes: ${totalStudents}`);
  console.log(`   📝 Inscripciones: ${totalEnrollments}`);
  console.log(`   📅 Asistencias: ${totalAttendances}`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('   Admin: admin@cpfp6.edu.ar / 123456');
  console.log('   Profesor 1: profesor1@cpfp6.edu.ar / 123456');
  console.log('   Profesor 2: profesor2@cpfp6.edu.ar / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
