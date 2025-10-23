// Frontend/src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

function Login({ setToken, setUser }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    numero_colegiado: '',
    dpi: '',
    fecha_nacimiento: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.numero_colegiado || !formData.dpi || !formData.fecha_nacimiento || !formData.password) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    try {
      console.log('🔐 Intentando login con:', { 
        numero_colegiado: formData.numero_colegiado,
        dpi: formData.dpi.substring(0, 4) + '***' // Log parcial por seguridad
      })

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('📥 Respuesta del servidor:', { success: response.ok, hasToken: !!data.token })

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }

      // Guardar en localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.ingeniero))

      console.log('✅ Login exitoso, redirigiendo a campañas...')

      // Actualizar estado
      setToken(data.token)
      setUser(data.ingeniero)

      // ✅ CORRECCIÓN: Navegar a /campañas en lugar de /votacion
      navigate('/campañas')
    } catch (err) {
      console.error('❌ Error en login:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="text-center">
          <div className="auth-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h1 className="card-title">Iniciar Sesión</h1>
          <p className="card-subtitle">Sistema de Votación - Colegio de Ingenieros de Guatemala</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="numero_colegiado" className="form-label">
              Número de Colegiado
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
          </div>

          <div className="form-group">
            <label htmlFor="dpi" className="form-label">
              DPI
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
          </div>

          <div className="form-group">
            <label htmlFor="fecha_nacimiento" className="form-label">
              Fecha de Nacimiento
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

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
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
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                Ingresando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Ingresar
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <p style={{ color: 'var(--text-secondary)' }}>
            ¿No estás registrado?{' '}
            <Link to="/register">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login