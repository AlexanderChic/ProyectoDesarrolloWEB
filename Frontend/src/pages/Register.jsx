// Frontend/src/pages/Register.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    numero_colegiado: '',
    dpi: '',
    email: '',
    password: '',
    fecha_nacimiento: '',
    departamento_id: '',
    municipio_id: '',
    especialidad: ''
  })
  const [departamentos, setDepartamentos] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDepartamentos()
  }, [])

  useEffect(() => {
    if (formData.departamento_id) {
      fetchMunicipios(formData.departamento_id)
    } else {
      setMunicipios([])
      setFormData(prev => ({ ...prev, municipio_id: '' }))
    }
  }, [formData.departamento_id])

  const fetchDepartamentos = async () => {
    try {
      console.log('🔍 Obteniendo departamentos...')
      const response = await fetch(`${API_URL}/departamentos`)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error('Error al cargar departamentos')
      }
      
      const data = await response.json()
      console.log('Departamentos recibidos:', data)
      
      // Asegurarse de que data es un array
      if (Array.isArray(data)) {
        setDepartamentos(data)
      } else {
        console.error('Los datos no son un array:', data)
        setDepartamentos([])
        setError('Error al cargar los departamentos')
      }
    } catch (err) {
      console.error('Error al cargar departamentos:', err)
      setDepartamentos([])
      setError('No se pudieron cargar los departamentos. Verifica la conexión.')
    }
  }

  const fetchMunicipios = async (departamentoId) => {
    try {
      console.log('🔍 Obteniendo municipios para departamento:', departamentoId)
      const response = await fetch(`${API_URL}/municipios/departamento/${departamentoId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar municipios')
      }
      
      const data = await response.json()
      console.log('Municipios recibidos:', data)
      
      // Asegurarse de que data es un array
      if (Array.isArray(data)) {
        setMunicipios(data)
      } else {
        console.error('Los datos no son un array:', data)
        setMunicipios([])
      }
    } catch (err) {
      console.error('Error al cargar municipios:', err)
      setMunicipios([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.nombre || !formData.numero_colegiado || !formData.dpi || !formData.email || 
        !formData.password || !formData.fecha_nacimiento || !formData.departamento_id || !formData.municipio_id) {
      setError('Por favor completa todos los campos obligatorios')
      setLoading(false)
      return
    }

    if (formData.dpi.length !== 13) {
      setError('El DPI debe tener exactamente 13 dígitos')
      setLoading(false)
      return
    }

    try {
      console.log('📝 Enviando datos de registro:', formData)
      
      const response = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('Respuesta del servidor:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse')
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      console.error('Error en registro:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="card" style={{ maxWidth: '800px', width: '100%' }}>
        <div className="text-center">
          <div className="auth-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
            </svg>
          </div>
          <h1 className="card-title">Registro de Ingeniero Colegiado</h1>
          <p className="card-subtitle">Colegio de Ingenieros de Guatemala</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>¡Registro exitoso! Redirigiendo al inicio de sesión...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Nombre completo */}
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="form-input"
                placeholder="Juan Pérez López"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            {/* Número de Colegiado */}
            <div className="form-group">
              <label htmlFor="numero_colegiado" className="form-label">
                Número de Colegiado *
              </label>
              <input
                type="text"
                id="numero_colegiado"
                name="numero_colegiado"
                className="form-input"
                placeholder="12345"
                value={formData.numero_colegiado}
                onChange={handleChange}
                required
              />
              <span className="form-hint">Tu número de registro en el Colegio</span>
            </div>

            {/* DPI */}
            <div className="form-group">
              <label htmlFor="dpi" className="form-label">
                DPI *
              </label>
              <input
                type="text"
                id="dpi"
                name="dpi"
                className="form-input"
                placeholder="1234567890123"
                value={formData.dpi}
                onChange={handleChange}
                maxLength="13"
                required
              />
              <span className="form-hint">Debe tener 13 dígitos</span>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="form-group">
              <label htmlFor="fecha_nacimiento" className="form-label">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                className="form-input"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className="form-hint">Mínimo 8 caracteres</span>
            </div>

            {/* Especialidad */}
            <div className="form-group">
              <label htmlFor="especialidad" className="form-label">
                Especialidad
              </label>
              <select
                id="especialidad"
                name="especialidad"
                className="form-select"
                value={formData.especialidad}
                onChange={handleChange}
              >
                <option value="">Selecciona una especialidad</option>
                <option value="Civil">Ingeniería Civil</option>
                <option value="Industrial">Ingeniería Industrial</option>
                <option value="Sistemas">Ingeniería en Sistemas</option>
                <option value="Electrica">Ingeniería Eléctrica</option>
                <option value="Mecanica">Ingeniería Mecánica</option>
                <option value="Quimica">Ingeniería Química</option>
                <option value="Electronica">Ingeniería Electrónica</option>
                <option value="Ambiental">Ingeniería Ambiental</option>
                <option value="Otra">Otra</option>
              </select>
            </div>

            {/* Departamento */}
            <div className="form-group">
              <label htmlFor="departamento_id" className="form-label">
                Departamento *
              </label>
              <select
                id="departamento_id"
                name="departamento_id"
                className="form-select"
                value={formData.departamento_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un departamento</option>
                {departamentos.length > 0 ? (
                  departamentos.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nombre}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Cargando departamentos...</option>
                )}
              </select>
            </div>

            {/* Municipio */}
            <div className="form-group">
              <label htmlFor="municipio_id" className="form-label">
                Municipio *
              </label>
              <select
                id="municipio_id"
                name="municipio_id"
                className="form-select"
                value={formData.municipio_id}
                onChange={handleChange}
                required
                disabled={!formData.departamento_id}
              >
                <option value="">Selecciona un municipio</option>
                {municipios.length > 0 ? (
                  municipios.map((mun) => (
                    <option key={mun.id} value={mun.id}>
                      {mun.nombre}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {formData.departamento_id ? 'Cargando municipios...' : 'Primero selecciona un departamento'}
                  </option>
                )}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading || success}
            style={{ marginTop: '1rem' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                Registrando...
              </>
            ) : success ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                ¡Registrado!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
                Registrarse
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <p style={{ color: 'var(--text-secondary)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register