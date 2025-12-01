-- Datos de ejemplo para el sistema de asistencias

-- Insertar profesores de ejemplo (estos se crearán automáticamente cuando los usuarios se registren)
-- Pero podemos insertar algunos datos de ejemplo directamente

-- Insertar cursos de ejemplo
INSERT INTO cursos (id, nombre, profesor_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Programación Web', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Base de Datos', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Redes y Comunicaciones', '550e8400-e29b-41d4-a716-446655440000');

-- Insertar alumnos de ejemplo
INSERT INTO alumnos (nombre, apellido, dni, curso_id) VALUES
    -- Alumnos de Programación Web
    ('Juan', 'Pérez', '12345678', '550e8400-e29b-41d4-a716-446655440001'),
    ('María', 'González', '23456789', '550e8400-e29b-41d4-a716-446655440001'),
    ('Carlos', 'López', '34567890', '550e8400-e29b-41d4-a716-446655440001'),
    ('Ana', 'Martínez', '45678901', '550e8400-e29b-41d4-a716-446655440001'),
    ('Luis', 'Rodríguez', '56789012', '550e8400-e29b-41d4-a716-446655440001'),
    
    -- Alumnos de Base de Datos
    ('Sofia', 'Fernández', '67890123', '550e8400-e29b-41d4-a716-446655440002'),
    ('Diego', 'Silva', '78901234', '550e8400-e29b-41d4-a716-446655440002'),
    ('Valentina', 'Torres', '89012345', '550e8400-e29b-41d4-a716-446655440002'),
    ('Mateo', 'Vargas', '90123456', '550e8400-e29b-41d4-a716-446655440002'),
    
    -- Alumnos de Redes y Comunicaciones
    ('Camila', 'Herrera', '01234567', '550e8400-e29b-41d4-a716-446655440003'),
    ('Santiago', 'Morales', '11234567', '550e8400-e29b-41d4-a716-446655440003'),
    ('Isabella', 'Castro', '21234567', '550e8400-e29b-41d4-a716-446655440003');

-- Insertar asistencias de ejemplo (últimos 7 días)
-- Nota: Estas se insertarán cuando tengas un profesor registrado con el ID correcto
-- Por ahora, comentamos estas inserciones hasta que tengas usuarios reales

/*
INSERT INTO asistencias (alumno_id, fecha, estado, cargado_por) 
SELECT 
    a.id as alumno_id,
    CURRENT_DATE - (random() * 7)::int as fecha,
    CASE 
        WHEN random() < 0.8 THEN 'presente'
        WHEN random() < 0.9 THEN 'tarde'
        ELSE 'ausente'
    END as estado,
    '550e8400-e29b-41d4-a716-446655440000' as cargado_por
FROM alumnos a
CROSS JOIN generate_series(0, 6) as days
WHERE random() > 0.2; -- No todos los días tienen asistencia
*/
