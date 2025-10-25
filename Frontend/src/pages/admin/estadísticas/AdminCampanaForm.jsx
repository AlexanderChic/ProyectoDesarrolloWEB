// Frontend/src/pages/admin/estadísticas/AdminCampanaForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function AdminCampanaForm({ token }) {
  const navigate = useNavigate()
  const { id } = useParams() // Si hay ID, es edición
  const esEdicion = !!id

  const [formData, setFormData] = useState({
    titulo: '',
    nombre: '',
    descripcion: '',
    color: '#3B82F6',
    logo_url: '',
    fecha_inicio: '',
    fecha_fin: '',
    votos_por_votante: 7,
    estado: 'programada'
  })

  const [loading, setLoading] = useState(false)
  const [loadingCampana, setLoadingCampana] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (esEdicion) {
      fetchCampana()
    }
  }, [id])

  const fetchCampana = async () => {
    try {
      setLoadingCampana(true)
      const response = await fetch(`${API_URL}/campanas/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener campaña')
      }

      const data = await response.json()
      
      // Convertir fechas al formato correcto para input datetime-local
      const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        titulo: data.titulo || '',
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        color: data.color || '#3B82F6',
        logo_url: data.logo_url || '',
        fecha_inicio: formatDateForInput(data.fecha_inicio),
        fecha_fin: formatDateForInput(data.fecha_fin),
        votos_por_votante: data.votos_por_votante || 7,
        estado: data.estado || 'programada'
      })

      console.log('✅ Campaña cargada para edición:', data.nombre)
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoadingCampana(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validaciones
    if (!formData.titulo || !formData.nombre) {
      setError('El título y nombre son obligatorios')
      setLoading(false)
      return
    }

    if (formData.votos_por_votante < 1 || formData.votos_por_votante > 20) {
      setError('Los votos por votante deben estar entre 1 y 20')
      setLoading(false)
      return
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const inicio = new Date(formData.fecha_inicio)
      const fin = new Date(formData.fecha_fin)
      
      if (fin <= inicio) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio')
        setLoading(false)
        return
      }
    }

    try {
      const url = esEdicion 
        ? `${API_URL}/campanas/${id}` 
        : `${API_URL}/campanas`
      
      const method = esEdicion ? 'PUT' : 'POST'

      console.log(`${esEdicion ? '✏️ Editando' : '➕ Creando'} campaña:`, formData)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar campaña')
      }

      console.log('✅ Campaña guardada:', data)
      setSuccessMessage(esEdicion ? 'Campaña actualizada exitosamente' : 'Campaña creada exitosamente')
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate('/admin/campanas')
      }, 1500)

    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingCampana) {
    return (
      <div className="page-container">
        <div className="text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando campaña...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Link to="/admin/campanas" className="btn btn-secondary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver
          </Link>
          <h1 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '2rem', height: '2rem', color: 'var(--primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            {esEdicion ? 'Editar Campaña' : 'Nueva Campaña'}
          </h1>
        </div>
        <p className="card-subtitle">
          {esEdicion 
            ? 'Modifica los datos de la campaña de votación' 
            : 'Crea una nueva campaña de votación'
          }
        </p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Formulario */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Información Básica */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Información Básica
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="titulo" className="form-label">
                    Título de la Campaña *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    className="form-input"
                    placeholder="Elecciones Junta Directiva 2025"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                  />
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Nombre descriptivo de la campaña
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre Corto *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="form-input"
                    placeholder="Junta 2025"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Identificador único de la campaña
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    className="form-input"
                    placeholder="Describe el propósito de esta campaña de votación..."
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Configuración Visual */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Configuración Visual
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="color" className="form-label">
                    Color de la Campaña
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      style={{ 
                        width: '60px', 
                        height: '40px', 
                        border: '2px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="form-input"
                      placeholder="#3B82F6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Color representativo de la campaña
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="logo_url" className="form-label">
                    URL del Logo
                  </label>
                  <input
                    type="url"
                    id="logo_url"
                    name="logo_url"
                    className="form-input"
                    placeholder="https://ejemplo.com/logo.png"
                    value={formData.logo_url}
                    onChange={handleChange}
                  />
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    URL de la imagen del logo (opcional)
                  </small>
                </div>
              </div>

              {/* Preview */}
              {(formData.color || formData.logo_url) && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Vista Previa:
                  </div>
                  <div 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '8px',
                      background: formData.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--border-color)'
                    }}
                  >
                    {formData.logo_url ? (
                      <img 
                        src={formData.logo_url} 
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" style={{ width: '40px', height: '40px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Configuración de Votación */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Configuración de Votación
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="fecha_inicio" className="form-label">
                    Fecha y Hora de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    className="form-input"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                  />
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Cuándo inicia la votación
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="fecha_fin" className="form-label">
                    Fecha y Hora de Fin
                  </label>
                  <input
                    type="datetime-local"
                    id="fecha_fin"
                    name="fecha_fin"
                    className="form-input"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                  />
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Cuándo finaliza la votación
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="votos_por_votante" className="form-label">
                    Votos por Votante *
                  </label>
                  <input
                    type="number"
                    id="votos_por_votante"
                    name="votos_por_votante"
                    className="form-input"
                    min="1"
                    max="20"
                    value={formData.votos_por_votante}
                    onChange={handleChange}
                    required
                  />
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Cantidad de votos permitidos (1-20)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="estado" className="form-label">
                    Estado de la Campaña *
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    className="form-input"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                  >
                    <option value="programada">Programada</option>
                    <option value="activa">Activa</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Estado actual de la campaña
                  </small>
                </div>
              </div>

              {/* Info adicional sobre estados */}
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  ℹ️ Información sobre estados:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  <li><strong>Programada:</strong> La campaña está configurada pero aún no está disponible para votar</li>
                  <li><strong>Activa:</strong> Los usuarios pueden emitir sus votos en esta campaña</li>
                  <li><strong>Finalizada:</strong> La votación ha terminado, solo se pueden ver resultados</li>
                </ul>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <Link to="/admin/campanas" className="btn btn-secondary">
                Cancelar
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                    {esEdicion ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {esEdicion ? 'Actualizar Campaña' : 'Crear Campaña'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminCampanaForm