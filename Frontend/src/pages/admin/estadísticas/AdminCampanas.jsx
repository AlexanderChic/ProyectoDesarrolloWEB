// Frontend/src/pages/admin/estadísticas/AdminCampanas.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

function AdminCampanas({ token }) {
  const [campanas, setCampanas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchCampanas()
  }, [])

  const fetchCampanas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/campanas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener campañas')
      }

      const data = await response.json()
      setCampanas(data)
      console.log('✅ Campañas cargadas:', data.length)
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarEstado = async (campanaId, nuevoEstado) => {
    try {
      const response = await fetch(`${API_URL}/campanas/${campanaId}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      if (!response.ok) {
        throw new Error('Error al cambiar estado')
      }

      setSuccessMessage(`Estado cambiado a: ${nuevoEstado}`)
      setTimeout(() => setSuccessMessage(''), 3000)
      
      fetchCampanas()
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    }
  }

  const handleEliminar = async (campanaId, nombreCampana) => {
    if (!confirm(`¿Estás seguro de eliminar la campaña "${nombreCampana}"?\n\nEsto eliminará todos los candidatos y votos asociados.`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/campanas/${campanaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al eliminar campaña')
      }

      setSuccessMessage('Campaña eliminada exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      fetchCampanas()
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    }
  }

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'activa': return 'badge-success'
      case 'programada': return 'badge-warning'
      case 'finalizada': return 'badge-error'
      default: return 'badge-secondary'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando campañas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '2rem', height: '2rem', color: 'var(--primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            Gestión de Campañas
          </h1>
          <p className="card-subtitle">Administra las campañas de votación</p>
        </div>
        <Link to="/admin/campanas/nueva" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Campaña
        </Link>
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

      {/* Lista de Campañas */}
      {campanas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: 'var(--text-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No hay campañas</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Crea tu primera campaña de votación
          </p>
          <Link to="/admin/campanas/nueva" className="btn btn-primary">
            Crear Campaña
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {campanas.map((campana) => (
            <div key={campana.campana_id} className="card">
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Logo */}
                <div 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '8px',
                    background: campana.color || '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {campana.logo_url ? (
                    <img 
                      src={campana.logo_url} 
                      alt={campana.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" style={{ width: '40px', height: '40px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  )}
                </div>

                {/* Información */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                        {campana.titulo || campana.nombre}
                      </h3>
                      <span className={`badge ${getEstadoBadgeClass(campana.estado)}`}>
                        {campana.estado}
                      </span>
                    </div>
                  </div>

                  {campana.descripcion && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {campana.descripcion}
                    </p>
                  )}

                  {/* Estadísticas */}
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Candidatos: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{campana.total_candidatos}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Votos: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{campana.total_votos}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Votantes: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{campana.total_votantes}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Votos permitidos: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{campana.votos_por_votante || 1}</strong>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <div>Inicio: {formatDate(campana.fecha_inicio)}</div>
                    <div>Fin: {formatDate(campana.fecha_fin)}</div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <Link 
                      to={`/admin/candidatos/${campana.campana_id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                      </svg>
                      Gestionar Candidatos
                    </Link>

                    <Link 
                      to={`/admin/campanas/editar/${campana.campana_id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Editar
                    </Link>

                    {/* Botones de cambio de estado */}
                    {campana.estado === 'programada' && (
                      <button 
                        onClick={() => handleCambiarEstado(campana.campana_id, 'activa')}
                        className="btn btn-success btn-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                        Activar
                      </button>
                    )}

                    {campana.estado === 'activa' && (
                      <button 
                        onClick={() => handleCambiarEstado(campana.campana_id, 'finalizada')}
                        className="btn btn-warning btn-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                        </svg>
                        Finalizar
                      </button>
                    )}

                    <button 
                      onClick={() => handleEliminar(campana.campana_id, campana.nombre)}
                      className="btn btn-danger btn-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminCampanas