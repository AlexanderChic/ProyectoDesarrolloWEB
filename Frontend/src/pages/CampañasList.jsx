// Frontend/src/pages/CampañasList.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

const API_URL = 'http://localhost:5000'

function CampañasList({ token, user }) {
  const navigate = useNavigate()
  const [campanas, setCampanas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    cargarCampanas()
  }, [token])

  const cargarCampanas = async () => {
    try {
      console.log('📊 Cargando campañas desde:', `${API_URL}/campanas`);
      
      const response = await fetch(`${API_URL}/campanas`)
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json()
      console.log('✅ Campañas cargadas:', data.length);
      
      setCampanas(data)
      setLoading(false)
    } catch (err) {
      console.error('❌ Error al cargar campañas:', err)
      setError('Error al cargar las campañas disponibles: ' + err.message)
      setLoading(false)
    }
  }

  const obtenerEstadoBadge = (estado_actual) => {
    const estados = {
      'En Curso': { color: '#10B981', bg: '#10B98120', text: '🟢 En Curso' },
      'Programada': { color: '#F59E0B', bg: '#F59E0B20', text: '🟡 Programada' },
      'Finalizada': { color: '#EF4444', bg: '#EF444420', text: '🔴 Finalizada' },
      'Inactiva': { color: '#6B7280', bg: '#6B728020', text: '⚫ Inactiva' }
    }
    return estados[estado_actual] || estados['Inactiva']
  }

  const formatearTiempoRestante = (fecha_fin) => {
    if (!fecha_fin) return null
    
    const ahora = new Date()
    const fin = new Date(fecha_fin)
    const diferencia = fin - ahora

    if (diferencia <= 0) return 'Finalizada'

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))

    if (dias > 0) return `${dias}d ${horas}h restantes`
    if (horas > 0) return `${horas}h ${minutos}m restantes`
    return `${minutos}m restantes`
  }

  const verDetallesCampana = (campana_id) => {
    navigate(`/campana/${campana_id}`)
  }

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando campañas disponibles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={cargarCampanas} className="btn btn-primary">
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Campañas Electorales</h1>
          <p className="card-subtitle">
            Selecciona una campaña para ver los candidatos y emitir tu voto
          </p>
        </div>

        {campanas.length === 0 ? (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <span>No hay campañas disponibles en este momento</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
            {campanas.map((campana) => {
              const estadoBadge = obtenerEstadoBadge(campana.estado_actual)
              const tiempoRestante = formatearTiempoRestante(campana.fecha_fin)
              const puedeVotar = campana.estado_actual === 'En Curso'

              return (
                <div
                  key={campana.campana_id}
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--border-radius)',
                    border: `2px solid ${campana.color}40`,
                    borderLeft: `6px solid ${campana.color}`,
                    background: `linear-gradient(135deg, ${campana.color}08 0%, transparent 100%)`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: puedeVotar ? 1 : 0.7
                  }}
                  onClick={() => verDetallesCampana(campana.campana_id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        color: campana.color,
                        marginBottom: '0.5rem'
                      }}>
                        {campana.titulo || campana.nombre}
                      </h2>
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.95rem',
                        lineHeight: '1.5'
                      }}>
                        {campana.descripcion}
                      </p>
                    </div>

                    {/* Badge de estado */}
                    <div style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      backgroundColor: estadoBadge.bg,
                      color: estadoBadge.color,
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      marginLeft: '1rem'
                    }}>
                      {estadoBadge.text}
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--bg-tertiary)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        👥 Candidatos
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: campana.color }}>
                        {campana.total_candidatos}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        🗳️ Total Votos
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: campana.color }}>
                        {campana.total_votos}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        📊 Votantes
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: campana.color }}>
                        {campana.total_votantes}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        🎯 Votos por persona
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: campana.color }}>
                        {campana.votos_por_votante}
                      </div>
                    </div>
                  </div>

                  {/* Tiempo restante */}
                  {tiempoRestante && tiempoRestante !== 'Finalizada' && puedeVotar && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      borderRadius: 'var(--border-radius)',
                      background: `${campana.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={campana.color} style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <div>
                        <div style={{ fontWeight: '600', color: campana.color }}>
                          ⏱️ {tiempoRestante}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          para completar tu votación
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: 'var(--border-radius)',
                        border: 'none',
                        background: puedeVotar ? `linear-gradient(135deg, ${campana.color} 0%, ${campana.color}CC 100%)` : 'var(--bg-tertiary)',
                        color: puedeVotar ? 'white' : 'var(--text-secondary)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: puedeVotar ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (puedeVotar) {
                          verDetallesCampana(campana.campana_id)
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (puedeVotar) {
                          e.currentTarget.style.transform = 'scale(1.02)'
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {puedeVotar ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                          Ver Candidatos y Votar
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          Ver Resultados
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Botón de actualizar */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={cargarCampanas} 
          className="btn btn-primary"
          disabled={loading}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor"
            style={{ width: '20px', height: '20px' }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" 
            />
          </svg>
          Actualizar Campañas
        </button>
      </div>
    </div>
  )
}

export default CampañasList