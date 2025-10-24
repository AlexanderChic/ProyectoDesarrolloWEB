// Backend/api.js - VERSIÓN COMPLETA Y CORREGIDA
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'votaciones_colegio',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

const JWT_SECRET = process.env.JWT_SECRET || 'colegio_ingenieros_secret_2024';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// Middleware de verificación de admin
const verificarAdmin = (req, res, next) => {
  if (!req.ingeniero || req.ingeniero.rol !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

// Middleware de autenticación
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.ingeniero = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

app.post('/auth/registro', async (req, res) => {
  console.log('📝 Solicitud de registro recibida');
  
  const { 
    nombre, numero_colegiado, dpi, email, password, 
    fecha_nacimiento, departamento_id, municipio_id, especialidad 
  } = req.body;

  try {
    if (!nombre || !numero_colegiado || !dpi || !email || !password || !fecha_nacimiento) {
      return res.status(400).json({ 
        message: 'Todos los campos obligatorios deben estar completos'
      });
    }

    if (dpi.length !== 13) {
      return res.status(400).json({ message: 'El DPI debe tener exactamente 13 dígitos' });
    }

    if (!departamento_id || !municipio_id) {
      return res.status(400).json({ message: 'Debes seleccionar departamento y municipio' });
    }

    const existente = await pool.query(
      `SELECT * FROM ingenieros_colegiados 
       WHERE dpi = $1 OR email = $2 OR numero_colegiado = $3`,
      [dpi, email, numero_colegiado]
    );

    if (existente.rows.length > 0) {
      const ingeniero = existente.rows[0];
      if (ingeniero.dpi === dpi) return res.status(400).json({ message: 'El DPI ya está registrado' });
      if (ingeniero.email === email) return res.status(400).json({ message: 'El correo ya está registrado' });
      if (ingeniero.numero_colegiado === numero_colegiado) return res.status(400).json({ message: 'El número de colegiado ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO ingenieros_colegiados 
      (nombre, numero_colegiado, dpi, email, password, fecha_nacimiento, 
       departamento_id, municipio_id, especialidad) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id, nombre, numero_colegiado, email, fecha_nacimiento, especialidad
    `;

    const resultado = await pool.query(query, [
      nombre, numero_colegiado, dpi, email, passwordHash, 
      fecha_nacimiento, parseInt(departamento_id), 
      parseInt(municipio_id), especialidad || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Ingeniero colegiado registrado exitosamente',
      ingeniero: resultado.rows[0]
    });

  } catch (error) {
    console.error('❌ ERROR EN REGISTRO:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

app.post('/auth/login', async (req, res) => {
  const { numero_colegiado, dpi, fecha_nacimiento, password } = req.body;

  try {
    console.log('🔐 Intento de login:', { numero_colegiado, dpi: dpi?.substring(0,4) + '***' });

    const resultado = await pool.query(
      'SELECT * FROM ingenieros_colegiados WHERE numero_colegiado = $1',
      [numero_colegiado]
    );

    if (resultado.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const ingeniero = resultado.rows[0];

    if (ingeniero.dpi !== dpi || ingeniero.fecha_nacimiento.toISOString().split('T')[0] !== fecha_nacimiento) {
      console.log('❌ DPI o fecha incorrectos');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, ingeniero.password);
    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // ✅ Incluir rol en el token
    const token = jwt.sign(
      { 
        id: ingeniero.id, 
        numero_colegiado: ingeniero.numero_colegiado,
        nombre: ingeniero.nombre,
        email: ingeniero.email,
        rol: ingeniero.rol || 'usuario'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    delete ingeniero.password;

    console.log('✅ Login exitoso:', ingeniero.nombre, '| Rol:', ingeniero.rol);

    res.json({
      message: 'Login exitoso',
      token,
      ingeniero: {
        ...ingeniero,
        es_admin: ingeniero.rol === 'admin'
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

app.get('/auth/verificar-admin', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, email, rol FROM ingenieros_colegiados WHERE id = $1',
      [req.ingeniero.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = resultado.rows[0];
    
    res.json({
      es_admin: usuario.rol === 'admin',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('❌ Error al verificar admin:', error);
    res.status(500).json({ message: 'Error al verificar permisos' });
  }
});

// ============================================
// RUTAS DE CAMPAÑAS
// ============================================

app.get('/campanas', async (req, res) => {
  try {
    console.log('📊 Obteniendo campañas...');
    
    const resultado = await pool.query(`
      SELECT 
        c.id as campana_id,
        c.titulo,
        c.nombre,
        c.descripcion,
        c.color,
        c.logo_url,
        c.fecha_inicio,
        c.fecha_fin,
        c.votos_por_votante,
        c.estado,
        c.fecha_creacion,
        COUNT(DISTINCT ca.id) as total_candidatos,
        COUNT(DISTINCT v.id) as total_votos,
        COUNT(DISTINCT v.ingeniero_id) as total_votantes,
        CASE 
          WHEN c.fecha_inicio IS NULL OR c.fecha_fin IS NULL THEN 'Inactiva'
          WHEN NOW() < c.fecha_inicio THEN 'Programada'
          WHEN NOW() BETWEEN c.fecha_inicio AND c.fecha_fin THEN 'En Curso'
          WHEN NOW() > c.fecha_fin THEN 'Finalizada'
          ELSE 'Inactiva'
        END as estado_actual
      FROM campañas c
      LEFT JOIN candidatos ca ON ca.campaña_id = c.id
      LEFT JOIN votos v ON v.campaña_id = c.id
      GROUP BY c.id, c.titulo, c.nombre, c.descripcion, c.color, c.logo_url, 
               c.fecha_inicio, c.fecha_fin, c.votos_por_votante, c.estado, c.fecha_creacion
      ORDER BY 
        CASE c.estado
          WHEN 'activa' THEN 1
          WHEN 'programada' THEN 2
          WHEN 'finalizada' THEN 3
        END,
        c.fecha_inicio DESC
    `);

    console.log(`✅ ${resultado.rows.length} campañas encontradas`);
    res.json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al obtener campañas:', error);
    res.status(500).json({ 
      message: 'Error al obtener campañas', 
      error: error.message
    });
  }
});

app.get('/campanas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Obteniendo campaña ID:', id);

    const campanaResult = await pool.query(`
      SELECT 
        c.id as campana_id,
        c.titulo,
        c.nombre,
        c.descripcion,
        c.color,
        c.logo_url,
        c.fecha_inicio,
        c.fecha_fin,
        c.votos_por_votante,
        c.estado,
        COUNT(DISTINCT ca.id) as total_candidatos,
        COUNT(DISTINCT v.id) as total_votos,
        COUNT(DISTINCT v.ingeniero_id) as total_votantes
      FROM campañas c
      LEFT JOIN candidatos ca ON ca.campaña_id = c.id
      LEFT JOIN votos v ON v.campaña_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (campanaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }

    const campana = campanaResult.rows[0];

    const candidatosResult = await pool.query(`
      SELECT 
        c.id,
        c.nombre,
        c.numero_colegiado,
        c.especialidad,
        c.numero_orden,
        c.foto_url,
        cd.id as cargo_id,
        cd.nombre as cargo_nombre,
        cd.orden as cargo_orden,
        COUNT(v.id) as total_votos
      FROM candidatos c
      JOIN cargos_directiva cd ON c.cargo_id = cd.id
      LEFT JOIN votos v ON v.candidato_id = c.id AND v.campaña_id = $1
      WHERE c.campaña_id = $1
      GROUP BY c.id, c.nombre, c.numero_colegiado, c.especialidad, 
               c.numero_orden, c.foto_url, cd.id, cd.nombre, cd.orden
      ORDER BY cd.orden ASC, c.numero_orden ASC
    `, [id]);

    const candidatosPorCargo = {};
    candidatosResult.rows.forEach(candidato => {
      const cargoKey = candidato.cargo_id;
      if (!candidatosPorCargo[cargoKey]) {
        candidatosPorCargo[cargoKey] = {
          cargo_id: candidato.cargo_id,
          cargo_nombre: candidato.cargo_nombre,
          cargo_orden: candidato.cargo_orden,
          candidatos: []
        };
      }
      candidatosPorCargo[cargoKey].candidatos.push({
        id: candidato.id,
        nombre: candidato.nombre,
        numero_colegiado: candidato.numero_colegiado,
        especialidad: candidato.especialidad,
        numero_orden: candidato.numero_orden,
        foto_url: candidato.foto_url,
        total_votos: candidato.total_votos
      });
    });

    const cargos = Object.values(candidatosPorCargo).sort((a, b) => a.cargo_orden - b.cargo_orden);

    const ahora = new Date();
    const esta_activa = campana.fecha_inicio && campana.fecha_fin &&
                       ahora >= new Date(campana.fecha_inicio) && 
                       ahora <= new Date(campana.fecha_fin);

    let tiempoRestante = null;
    if (campana.fecha_fin) {
      const fin = new Date(campana.fecha_fin);
      tiempoRestante = Math.max(0, fin - ahora);
    }

    console.log('✅ Campaña encontrada:', campana.nombre);

    res.json({
      ...campana,
      cargos,
      esta_activa,
      tiempo_restante_ms: tiempoRestante,
      tiempo_restante: tiempoRestante ? {
        dias: Math.floor(tiempoRestante / (1000 * 60 * 60 * 24)),
        horas: Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((tiempoRestante % (1000 * 60)) / 1000)
      } : null
    });

  } catch (error) {
    console.error('❌ Error al obtener detalles de campaña:', error);
    res.status(500).json({ message: 'Error al obtener detalles', error: error.message });
  }
});

app.get('/campanas/:id/candidatos', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultado = await pool.query(`
      SELECT 
        c.*,
        cd.nombre as cargo_nombre,
        cd.orden as cargo_orden,
        COUNT(v.id) as total_votos
      FROM candidatos c
      JOIN cargos_directiva cd ON c.cargo_id = cd.id
      LEFT JOIN votos v ON v.candidato_id = c.id
      WHERE c.campaña_id = $1
      GROUP BY c.id, cd.nombre, cd.orden
      ORDER BY cd.orden ASC, c.numero_orden ASC
    `, [id]);
    
    res.json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al obtener candidatos:', error);
    res.status(500).json({ message: 'Error al obtener candidatos', error: error.message });
  }
});

app.get('/campanas/:id/votos-disponibles', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ingeniero_id = req.ingeniero.id;
    const MAX_VOTOS = 7;

    const campanaResult = await pool.query(`
      SELECT 
        CASE 
          WHEN fecha_inicio IS NULL OR fecha_fin IS NULL THEN FALSE
          WHEN NOW() BETWEEN fecha_inicio AND fecha_fin THEN TRUE
          ELSE FALSE
        END as puede_votar
      FROM campañas
      WHERE id = $1
    `, [id]);

    if (campanaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }

    const votosResult = await pool.query(`
      SELECT 
        COUNT(*) as votos_emitidos,
        array_agg(DISTINCT cargo_id) as cargos_votados
      FROM votos
      WHERE ingeniero_id = $1
    `, [ingeniero_id]);

    const votos_emitidos = parseInt(votosResult.rows[0].votos_emitidos);
    const votos_restantes = MAX_VOTOS - votos_emitidos;
    const cargos_votados = votosResult.rows[0].cargos_votados || [];

    res.json({
      votos_emitidos,
      votos_restantes,
      total_votos_permitidos: MAX_VOTOS,
      cargos_votados,
      puede_votar: campanaResult.rows[0].puede_votar && votos_restantes > 0
    });
  } catch (error) {
    console.error('❌ Error al obtener votos disponibles:', error);
    res.status(500).json({ 
      message: 'Error al obtener votos disponibles', 
      error: error.message 
    });
  }
});

app.get('/campanas/:id/resultados', async (req, res) => {
  try {
    const { id } = req.params;

    // CONSULTA CORREGIDA - Sin agregaciones anidadas
    const resultado = await pool.query(`
      SELECT 
        cd.id as cargo_id,
        cd.nombre as cargo,
        cd.orden as cargo_orden,
        c.id as candidato_id,
        c.nombre as candidato,
        c.numero_colegiado,
        COUNT(v.id) as total_votos
      FROM cargos_directiva cd
      LEFT JOIN candidatos c ON c.cargo_id = cd.id AND c.campaña_id = $1
      LEFT JOIN votos v ON v.candidato_id = c.id AND v.campaña_id = $1
      GROUP BY cd.id, cd.nombre, cd.orden, c.id, c.nombre, c.numero_colegiado
      ORDER BY cd.orden ASC, total_votos DESC
    `, [id]);

    // Agrupar resultados por cargo
    const resultadosPorCargo = {};
    
    resultado.rows.forEach(row => {
      const cargoId = row.cargo_id;
      
      if (!resultadosPorCargo[cargoId]) {
        resultadosPorCargo[cargoId] = {
          cargo_id: row.cargo_id,
          cargo: row.cargo,
          cargo_orden: row.cargo_orden,
          candidatos: []
        };
      }
      
      // Solo agregar candidatos que existan
      if (row.candidato_id) {
        resultadosPorCargo[cargoId].candidatos.push({
          candidato_id: row.candidato_id,
          candidato: row.candidato,
          numero_colegiado: row.numero_colegiado,
          total_votos: parseInt(row.total_votos)
        });
      }
    });

    // Convertir a array y ordenar
    const resultadosArray = Object.values(resultadosPorCargo)
      .sort((a, b) => a.cargo_orden - b.cargo_orden);

    console.log('✅ Resultados obtenidos para campaña:', id);
    res.json(resultadosArray);
    
  } catch (error) {
    console.error('❌ Error al obtener resultados:', error);
    res.status(500).json({ 
      message: 'Error al obtener resultados', 
      error: error.message 
    });
  }
});

// ============================================
// RUTAS ADMIN - CAMPAÑAS
// ============================================

// ✅ CORREGIDO: Crear campaña
app.post('/campanas', verificarToken, verificarAdmin, async (req, res) => {
  const { 
    titulo, nombre, descripcion, color, logo_url, 
    fecha_inicio, fecha_fin, votos_por_votante, estado 
  } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO campañas 
       (titulo, nombre, descripcion, color, logo_url, fecha_inicio, fecha_fin, 
        votos_por_votante, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        titulo, nombre, descripcion, color || '#3B82F6', logo_url,
        fecha_inicio, fecha_fin, votos_por_votante || 1, estado || 'programada'
      ]
    );
    res.status(201).json({
      message: 'Campaña creada exitosamente',
      campana: resultado.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al crear campaña:', error);
    res.status(500).json({ message: 'Error al crear campaña', error: error.message });
  }
});

// ✅ CORREGIDO: Actualizar campaña completa
app.put('/campanas/:id', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { 
    titulo, nombre, descripcion, color, logo_url, 
    fecha_inicio, fecha_fin, votos_por_votante, estado 
  } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE campañas 
       SET titulo = COALESCE($1, titulo),
           nombre = COALESCE($2, nombre),
           descripcion = COALESCE($3, descripcion),
           color = COALESCE($4, color),
           logo_url = COALESCE($5, logo_url),
           fecha_inicio = COALESCE($6, fecha_inicio),
           fecha_fin = COALESCE($7, fecha_fin),
           votos_por_votante = COALESCE($8, votos_por_votante),
           estado = COALESCE($9, estado)
       WHERE id = $10
       RETURNING *`,
      [titulo, nombre, descripcion, color, logo_url, 
       fecha_inicio, fecha_fin, votos_por_votante, estado, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }

    res.json({
      message: 'Campaña actualizada exitosamente',
      campana: resultado.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar campaña:', error);
    res.status(500).json({ message: 'Error al actualizar campaña', error: error.message });
  }
});

// ✅ NUEVO: Cambiar solo el estado de una campaña
app.patch('/campanas/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    if (!['programada', 'activa', 'finalizada'].includes(estado)) {
      return res.status(400).json({ 
        message: 'Estado inválido. Debe ser: programada, activa o finalizada' 
      });
    }

    const resultado = await pool.query(
      'UPDATE campañas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }

    res.json({
      message: 'Estado actualizado exitosamente',
      campana: resultado.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
  }
});

app.delete('/campanas/:id', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM votos WHERE campaña_id = $1', [id]);
    await client.query('DELETE FROM candidatos WHERE campaña_id = $1', [id]);
    
    const resultado = await client.query(
      'DELETE FROM campañas WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }

    await client.query('COMMIT');
    
    res.json({
      message: 'Campaña eliminada exitosamente',
      campana: resultado.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al eliminar campaña:', error);
    res.status(500).json({ message: 'Error al eliminar campaña', error: error.message });
  } finally {
    client.release();
  }
});

// ============================================
// CARGOS
// ============================================

app.get('/cargos', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM cargos_directiva ORDER BY orden ASC'
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener cargos:', error);
    res.status(500).json({ message: 'Error al obtener cargos', error: error.message });
  }
});

// ✅ CORREGIDO: Crear cargo (antes estaba duplicado con POST /candidatos)
app.post('/cargos', verificarToken, verificarAdmin, async (req, res) => {
  const { nombre, descripcion, orden } = req.body;

  try {
    const resultado = await pool.query(
      'INSERT INTO cargos_directiva (nombre, descripcion, orden) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, orden || 0]
    );
    res.status(201).json({
      message: 'Cargo creado exitosamente',
      cargo: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al crear cargo:', error);
    res.status(500).json({ message: 'Error al crear cargo', error: error.message });
  }
});

// ============================================
// CANDIDATOS
// ============================================

app.get('/candidatos/cargo/:cargo_id', async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT c.*, camp.nombre as campana_nombre, camp.color as campana_color
       FROM candidatos c
       LEFT JOIN campañas camp ON c.campaña_id = camp.id
       WHERE c.cargo_id = $1
       ORDER BY c.numero_orden ASC`,
      [req.params.cargo_id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener candidatos:', error);
    res.status(500).json({ message: 'Error al obtener candidatos', error: error.message });
  }
});

// ✅ CORREGIDO: Crear candidato (ahora solo uno)
app.post('/candidatos', verificarToken, verificarAdmin, async (req, res) => {
  const { nombre, numero_colegiado, cargo_id, campaña_id, numero_orden, especialidad, foto_url } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO candidatos 
       (nombre, numero_colegiado, cargo_id, campaña_id, numero_orden, especialidad, foto_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [nombre, numero_colegiado, cargo_id, campaña_id, numero_orden, especialidad, foto_url]
    );
    res.status(201).json({
      message: 'Candidato creado exitosamente',
      candidato: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al crear candidato:', error);
    res.status(500).json({ message: 'Error al crear candidato', error: error.message });
  }
});

app.put('/candidatos/:id', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, numero_colegiado, cargo_id, numero_orden, especialidad, foto_url } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE candidatos 
       SET nombre = COALESCE($1, nombre),
           numero_colegiado = COALESCE($2, numero_colegiado),
           cargo_id = COALESCE($3, cargo_id),
           numero_orden = COALESCE($4, numero_orden),
           especialidad = COALESCE($5, especialidad),
           foto_url = COALESCE($6, foto_url)
       WHERE id = $7
       RETURNING *`,
      [nombre, numero_colegiado, cargo_id, numero_orden, especialidad, foto_url, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Candidato no encontrado' });
    }

    res.json({
      message: 'Candidato actualizado exitosamente',
      candidato: resultado.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar candidato:', error);
    res.status(500).json({ message: 'Error al actualizar candidato', error: error.message });
  }
});

app.delete('/candidatos/:id', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM votos WHERE candidato_id = $1', [id]);
    
    const resultado = await client.query(
      'DELETE FROM candidatos WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Candidato no encontrado' });
    }

    await client.query('COMMIT');
    
    res.json({
      message: 'Candidato eliminado exitosamente',
      candidato: resultado.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al eliminar candidato:', error);
    res.status(500).json({ message: 'Error al eliminar candidato', error: error.message });
  } finally {
    client.release();
  }
});

// ============================================
// VOTOS
// ============================================

app.get('/mis-votos', verificarToken, async (req, res) => {
  try {
    const ingeniero_id = req.ingeniero.id;
    
    const resultado = await pool.query(
      `SELECT 
        v.*, 
        c.nombre as candidato, 
        cd.nombre as cargo,
        cd.orden as cargo_orden,
        cd.id as cargo_id,
        camp.nombre as campana,
        camp.color as campana_color,
        camp.titulo as campana_titulo
       FROM votos v
       JOIN candidatos c ON v.candidato_id = c.id
       JOIN cargos_directiva cd ON v.cargo_id = cd.id
       LEFT JOIN campañas camp ON v.campaña_id = camp.id
       WHERE v.ingeniero_id = $1
       ORDER BY cd.orden ASC`,
      [ingeniero_id]
    );
    
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener mis votos:', error);
    res.status(500).json({ 
      message: 'Error al obtener mis votos', 
      error: error.message 
    });
  }
});

app.get('/votos-disponibles', verificarToken, async (req, res) => {
  try {
    const ingeniero_id = req.ingeniero.id;
    const MAX_VOTOS = 7;

    const resultado = await pool.query(`
      SELECT 
        COUNT(*) as votos_emitidos,
        array_agg(DISTINCT cargo_id) as cargos_votados
      FROM votos
      WHERE ingeniero_id = $1
    `, [ingeniero_id]);

    const votos_emitidos = parseInt(resultado.rows[0].votos_emitidos);
    const votos_restantes = MAX_VOTOS - votos_emitidos;
    const cargos_votados = resultado.rows[0].cargos_votados || [];

    res.json({
      votos_emitidos,
      votos_restantes,
      total_votos_permitidos: MAX_VOTOS,
      cargos_votados,
      puede_votar: votos_restantes > 0
    });
  } catch (error) {
    console.error('❌ Error al obtener votos disponibles:', error);
    res.status(500).json({ 
      message: 'Error al obtener votos disponibles', 
      error: error.message 
    });
  }
});

app.get('/votos/ingeniero/:ingeniero_id', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT 
        v.*, 
        c.nombre as candidato, 
        cd.nombre as cargo,
        camp.nombre as campana, 
        camp.color as campana_color,
        camp.titulo as campana_titulo
       FROM votos v
       JOIN candidatos c ON v.candidato_id = c.id
       JOIN cargos_directiva cd ON v.cargo_id = cd.id
       LEFT JOIN campañas camp ON v.campaña_id = camp.id
       WHERE v.ingeniero_id = $1
       ORDER BY camp.nombre, cd.orden ASC`,
      [req.params.ingeniero_id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener votos:', error);
    res.status(500).json({ message: 'Error al obtener votos', error: error.message });
  }
});

app.get('/votos/ingeniero/:ingeniero_id/campana/:campana_id', verificarToken, async (req, res) => {
  try {
    const { ingeniero_id, campana_id } = req.params;
    
    const resultado = await pool.query(
      `SELECT 
        v.*, 
        c.nombre as candidato, 
        cd.nombre as cargo,
        cd.orden as cargo_orden,
        cd.id as cargo_id
       FROM votos v
       JOIN candidatos c ON v.candidato_id = c.id
       JOIN cargos_directiva cd ON v.cargo_id = cd.id
       WHERE v.ingeniero_id = $1 AND v.campaña_id = $2
       ORDER BY cd.orden ASC`,
      [ingeniero_id, campana_id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener votos:', error);
    res.status(500).json({ message: 'Error al obtener votos', error: error.message });
  }
});

app.post('/votos', verificarToken, async (req, res) => {
  const { candidato_id, cargo_id, campana_id } = req.body;
  const ingeniero_id = req.ingeniero.id;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const campanaActiva = await client.query(`
      SELECT 
        CASE 
          WHEN fecha_inicio IS NULL OR fecha_fin IS NULL THEN FALSE
          WHEN NOW() BETWEEN fecha_inicio AND fecha_fin THEN TRUE
          ELSE FALSE
        END as activa
      FROM campañas
      WHERE id = $1
    `, [campana_id]);

    if (!campanaActiva.rows[0].activa) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'La campaña no está disponible para votación en este momento' 
      });
    }

    const votoExistenteCargo = await client.query(
      'SELECT * FROM votos WHERE ingeniero_id = $1 AND cargo_id = $2',
      [ingeniero_id, cargo_id]
    );

    if (votoExistenteCargo.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Ya has votado en este cargo. Solo puedes votar una vez por cada cargo.' 
      });
    }

    const votosEmitidosTotal = await client.query(
      'SELECT COUNT(*) as total FROM votos WHERE ingeniero_id = $1',
      [ingeniero_id]
    );

    const totalVotos = parseInt(votosEmitidosTotal.rows[0].total);
    const MAX_VOTOS = 7;

    if (totalVotos >= MAX_VOTOS) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Ya has utilizado todos tus votos (máximo 7 votos)' 
      });
    }

    const ingeniero = await client.query(
      'SELECT departamento_id, municipio_id FROM ingenieros_colegiados WHERE id = $1',
      [ingeniero_id]
    );

    const { departamento_id, municipio_id } = ingeniero.rows[0];

    const resultado = await client.query(
      `INSERT INTO votos 
       (ingeniero_id, candidato_id, cargo_id, campaña_id, departamento_id, municipio_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [ingeniero_id, candidato_id, cargo_id, campana_id, departamento_id, municipio_id]
    );

    const votosRestantes = MAX_VOTOS - (totalVotos + 1);
    const completoVotacion = votosRestantes === 0;

    if (completoVotacion) {
      await client.query(
        'UPDATE ingenieros_colegiados SET ha_votado = true WHERE id = $1',
        [ingeniero_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Voto registrado exitosamente',
      voto: resultado.rows[0],
      votos_restantes: votosRestantes,
      votos_emitidos: totalVotos + 1,
      total_votos_permitidos: MAX_VOTOS,
      completo: completoVotacion
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar voto:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        message: 'Ya has votado en este cargo' 
      });
    }
    
    res.status(500).json({ message: 'Error al registrar voto', error: error.message });
  } finally {
    client.release();
  }
});

// ============================================
// DASHBOARD ADMIN
// ============================================

app.get('/admin/dashboard', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const estadisticas = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ingenieros_colegiados) as total_usuarios,
        (SELECT COUNT(*) FROM ingenieros_colegiados WHERE ha_votado = true) as usuarios_votaron,
        (SELECT COUNT(*) FROM campañas) as total_campanas,
        (SELECT COUNT(*) FROM campañas WHERE estado = 'activa') as campanas_activas,
        (SELECT COUNT(*) FROM candidatos) as total_candidatos,
        (SELECT COUNT(*) FROM votos) as total_votos
    `);

    const campanasRecientes = await pool.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT ca.id) as total_candidatos,
        COUNT(DISTINCT v.id) as total_votos,
        COUNT(DISTINCT v.ingeniero_id) as total_votantes
      FROM campañas c
      LEFT JOIN candidatos ca ON ca.campaña_id = c.id
      LEFT JOIN votos v ON v.campaña_id = c.id
      GROUP BY c.id
      ORDER BY c.fecha_creacion DESC
      LIMIT 5
    `);

    const votosRecientes = await pool.query(`
      SELECT 
        v.fecha_voto,
        i.nombre as votante,
        c.nombre as candidato,
        cd.nombre as cargo,
        camp.nombre as campana
      FROM votos v
      JOIN ingenieros_colegiados i ON v.ingeniero_id = i.id
      JOIN candidatos c ON v.candidato_id = c.id
      JOIN cargos_directiva cd ON v.cargo_id = cd.id
      JOIN campañas camp ON v.campaña_id = camp.id
      ORDER BY v.fecha_voto DESC
      LIMIT 10
    `);

    res.json({
      estadisticas: estadisticas.rows[0],
      campanas_recientes: campanasRecientes.rows,
      votos_recientes: votosRecientes.rows
    });
  } catch (error) {
    console.error('❌ Error al obtener dashboard:', error);
    res.status(500).json({ message: 'Error al obtener datos del dashboard', error: error.message });
  }
});

// ============================================
// REPORTES
// ============================================

app.get('/reportes/estadisticas', async (req, res) => {
  try {
    const ingenieros = await pool.query(`
      SELECT 
        COUNT(*) as total_ingenieros,
        SUM(CASE WHEN ha_votado = true THEN 1 ELSE 0 END) as ingenieros_votaron,
        SUM(CASE WHEN ha_votado = false THEN 1 ELSE 0 END) as ingenieros_pendientes
      FROM ingenieros_colegiados
    `);

    const votos = await pool.query('SELECT COUNT(*) as total_votos FROM votos');
    
    const campanas = await pool.query(`
      SELECT COUNT(*) as total_campanas,
             SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as campanas_activas
      FROM campañas
    `);

    res.json({
      ingenieros: ingenieros.rows[0],
      votos: votos.rows[0],
      campanas: campanas.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
});

app.get('/reportes/resultados', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        cd.nombre as cargo,
        c.nombre as candidato,
        c.numero_colegiado,
        c.especialidad,
        camp.nombre as campana,
        camp.color as campana_color,
        COUNT(v.id) as total_votos
      FROM cargos_directiva cd
      LEFT JOIN candidatos c ON c.cargo_id = cd.id
      LEFT JOIN campañas camp ON c.campaña_id = camp.id
      LEFT JOIN votos v ON v.candidato_id = c.id
      GROUP BY cd.id, cd.nombre, cd.orden, c.id, c.nombre, 
               c.numero_colegiado, c.especialidad, camp.nombre, camp.color
      ORDER BY cd.orden ASC, total_votos DESC
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({ message: 'Error al obtener resultados', error: error.message });
  }
});

app.get('/reportes/resultados-por-campana', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        c.id as campana_id,
        c.titulo,
        c.nombre as campana,
        c.descripcion,
        c.color as campana_color,
        c.fecha_inicio,
        c.fecha_fin,
        c.votos_por_votante,
        c.estado,
        COUNT(DISTINCT ca.id) as total_candidatos,
        COUNT(DISTINCT v.id) as total_votos,
        COUNT(DISTINCT v.ingeniero_id) as total_votantes
      FROM campañas c
      LEFT JOIN candidatos ca ON ca.campaña_id = c.id
      LEFT JOIN votos v ON v.campaña_id = c.id
      GROUP BY c.id
      ORDER BY total_votos DESC
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener resultados por campaña:', error);
    res.status(500).json({ message: 'Error al obtener resultados', error: error.message });
  }
});

// ============================================
// DEPARTAMENTOS Y MUNICIPIOS
// ============================================

app.get('/departamentos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM departamentos ORDER BY nombre ASC');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ message: 'Error al obtener departamentos', error: error.message });
  }
});

app.get('/municipios/departamento/:departamento_id', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM municipios WHERE departamento_id = $1 ORDER BY nombre ASC',
      [req.params.departamento_id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({ message: 'Error al obtener municipios', error: error.message });
  }
});

// ============================================
// TESTING
// ============================================

app.get('/test/db-connection', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: 'Conexión exitosa a la base de datos',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error de conexión',
      error: error.message 
    });
  }
});

// ============================================
// SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Sistema de Votación con Campañas - Colegio de Ingenieros`);
  console.log(`🌐 API disponible en: http://localhost:${PORT}`);
  console.log(`✅ Rutas sin caracteres especiales (ñ) en las URLs`);
  console.log(`\n📋 RUTAS PRINCIPALES:`);
  console.log(`   🔐 AUTH:`);
  console.log(`   POST /auth/registro                         - Registrar usuario`);
  console.log(`   POST /auth/login                            - Iniciar sesión`);
  console.log(`   GET  /auth/verificar-admin                  - Verificar rol admin`);
  console.log(`\n   👥 USUARIOS:`);
  console.log(`   GET  /votos-disponibles                     - Votos disponibles`);
  console.log(`   GET  /mis-votos                             - Mis votos emitidos`);
  console.log(`\n   📊 CAMPAÑAS (Público):`);
  console.log(`   GET  /campanas                              - Listar campañas`);
  console.log(`   GET  /campanas/:id                          - Detalles de campaña`);
  console.log(`   GET  /campanas/:id/resultados               - Resultados`);
  console.log(`\n   🔧 ADMIN - CAMPAÑAS:`);
  console.log(`   POST   /campanas                            - Crear campaña [ADMIN]`);
  console.log(`   PUT    /campanas/:id                        - Actualizar campaña [ADMIN]`);
  console.log(`   PATCH  /campanas/:id/estado                 - Cambiar estado [ADMIN]`);
  console.log(`   DELETE /campanas/:id                        - Eliminar campaña [ADMIN]`);
  console.log(`\n   🔧 ADMIN - CANDIDATOS:`);
  console.log(`   POST   /candidatos                          - Crear candidato [ADMIN]`);
  console.log(`   PUT    /candidatos/:id                      - Actualizar candidato [ADMIN]`);
  console.log(`   DELETE /candidatos/:id                      - Eliminar candidato [ADMIN]`);
  console.log(`   GET    /campanas/:id/candidatos             - Candidatos de campaña`);
  console.log(`\n   🔧 ADMIN - CARGOS:`);
  console.log(`   GET    /cargos                              - Listar cargos`);
  console.log(`   POST   /cargos                              - Crear cargo [ADMIN]`);
  console.log(`\n   📈 ADMIN - DASHBOARD:`);
  console.log(`   GET  /admin/dashboard                       - Panel administrativo [ADMIN]`);
});

// ============================================
// MANEJO DE CIERRE GRACEFUL
// ============================================

let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n⛔ Señal ${signal} recibida: Cerrando servidor...`);
  
  try {
    await pool.end();
    console.log('✅ Pool de PostgreSQL cerrado correctamente');
  } catch (err) {
    console.error('❌ Error al cerrar pool:', err);
  }
  
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});