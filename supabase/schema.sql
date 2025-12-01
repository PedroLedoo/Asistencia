-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de profesores
CREATE TABLE IF NOT EXISTS profesores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    profesor_id UUID NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('presente', 'ausente', 'tarde')) NOT NULL,
    cargado_por UUID NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(alumno_id, fecha)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_cursos_profesor_id ON cursos(profesor_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_curso_id ON alumnos(curso_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_alumno_id ON asistencias(alumno_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencias_cargado_por ON asistencias(cargado_por);

-- Función para sincronizar usuario de auth con tabla profesores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profesores (id, nombre, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nombre', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear profesor cuando se registra un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS (Row Level Security) Policies
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- Políticas para profesores
CREATE POLICY "Profesores pueden ver su propio perfil" ON profesores
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profesores pueden actualizar su propio perfil" ON profesores
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para cursos
CREATE POLICY "Profesores pueden ver sus propios cursos" ON cursos
    FOR SELECT USING (auth.uid() = profesor_id);

CREATE POLICY "Profesores pueden crear cursos" ON cursos
    FOR INSERT WITH CHECK (auth.uid() = profesor_id);

CREATE POLICY "Profesores pueden actualizar sus propios cursos" ON cursos
    FOR UPDATE USING (auth.uid() = profesor_id);

CREATE POLICY "Profesores pueden eliminar sus propios cursos" ON cursos
    FOR DELETE USING (auth.uid() = profesor_id);

-- Políticas para alumnos
CREATE POLICY "Profesores pueden ver alumnos de sus cursos" ON alumnos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cursos 
            WHERE cursos.id = alumnos.curso_id 
            AND cursos.profesor_id = auth.uid()
        )
    );

CREATE POLICY "Profesores pueden crear alumnos en sus cursos" ON alumnos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cursos 
            WHERE cursos.id = curso_id 
            AND cursos.profesor_id = auth.uid()
        )
    );

CREATE POLICY "Profesores pueden actualizar alumnos de sus cursos" ON alumnos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cursos 
            WHERE cursos.id = alumnos.curso_id 
            AND cursos.profesor_id = auth.uid()
        )
    );

CREATE POLICY "Profesores pueden eliminar alumnos de sus cursos" ON alumnos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cursos 
            WHERE cursos.id = alumnos.curso_id 
            AND cursos.profesor_id = auth.uid()
        )
    );

-- Políticas para asistencias
CREATE POLICY "Profesores pueden ver asistencias de sus alumnos" ON asistencias
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM alumnos 
            JOIN cursos ON alumnos.curso_id = cursos.id
            WHERE alumnos.id = asistencias.alumno_id 
            AND cursos.profesor_id = auth.uid()
        )
    );

CREATE POLICY "Profesores pueden crear asistencias de sus alumnos" ON asistencias
    FOR INSERT WITH CHECK (
        auth.uid() = cargado_por AND
        EXISTS (
            SELECT 1 FROM alumnos 
            JOIN cursos ON alumnos.curso_id = cursos.id
            WHERE alumnos.id = alumno_id 
            AND cursos.profesor_id = auth.uid()
        )
    );

CREATE POLICY "Profesores pueden actualizar asistencias que crearon" ON asistencias
    FOR UPDATE USING (auth.uid() = cargado_por);

CREATE POLICY "Profesores pueden eliminar asistencias que crearon" ON asistencias
    FOR DELETE USING (auth.uid() = cargado_por);
