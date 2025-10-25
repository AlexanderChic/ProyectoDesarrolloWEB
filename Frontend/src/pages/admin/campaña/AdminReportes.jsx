// Frontend/src/pages/admin/campaña/AdminReportes.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function AdminReportes({ token }) {
  const [campanas, setCampanas] = useState([])
  const [campanaSeleccionada, setCampanaSeleccionada] = useState(null)
  const [resultados, setResultados] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingResultados, setLoadingResultados] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener estadísticas generales
      const statsResponse = await fetch(`${API_URL}/reportes/estadisticas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!statsResponse.ok) {
        throw new Error('Error al obtener estadísticas')
      }
      
      const statsData = await statsResponse.json()
      setEstadisticas(statsData)

      // Obtener campañas
      const campanasResponse = await fetch(`${API_URL}/campanas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!campanasResponse.ok) {
        throw new Error('Error al obtener campañas')
      }
      
      const campanasData = await campanasResponse.json()
      setCampanas(campanasData)

      console.log('✅ Datos de reportes cargados')
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchResultadosCampana = async (campanaId) => {
    try {
      setLoadingResultados(true)
      
      const response = await fetch(`${API_URL}/campanas/${campanaId}/resultados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener resultados')
      }
      
      const data = await response.json()
      setResultados(data)
      
      const campana = campanas.find(c => c.campana_id === parseInt(campanaId))
      setCampanaSeleccionada(campana)
      
      console.log('✅ Resultados cargados para campaña:', campanaId)
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoadingResultados(false)
    }
  }

  const handleCampanaChange = (e) => {
    const campanaId = e.target.value
    if (campanaId) {
      fetchResultadosCampana(campanaId)
    } else {
      setCampanaSeleccionada(null)
      setResultados([])
    }
  }

  const calcularPorcentaje = (votos, totalVotos) => {
    if (totalVotos === 0) return 0
    return ((votos / totalVotos) * 100).toFixed(2)
  }

  const exportarCSV = () => {
    if (!campanaSeleccionada || resultados.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    let csv = 'Cargo,Candidato,Número Colegiado,Total Votos\n'
    
    resultados.forEach(cargo => {
      cargo.candidatos.forEach(candidato => {
        csv += `"${cargo.cargo}","${candidato.candidato}","${candidato.numero_colegiado}",${candidato.total_votos}\n`
      })
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `resultados_${campanaSeleccionada.nombre}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('✅ CSV exportado')
  }

  const imprimirReporte = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando reportes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '2rem', height: '2rem', color: 'var(--primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              Reportes y Estadísticas
            </h1>
            <p className="card-subtitle">Resultados de las votaciones</p>
          </div>

          {campanaSeleccionada && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={exportarCSV} className="btn btn-secondary btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Exportar CSV
              </button>
              <button onClick={imprimirReporte} className="btn btn-primary btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
                Imprimir
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Estadísticas Generales */}
      {estadisticas && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Estadísticas Generales del Sistema
          </h2>
          
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
              <div className="stat-label">Total Ingenieros</div>
              <div className="stat-value" style={{ color: '#3B82F6' }}>
                {estadisticas.ingenieros.total_ingenieros}
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#10B981' }}>
              <div className="stat-label">Han Votado</div>
              <div className="stat-value" style={{ color: '#10B981' }}>
                {estadisticas.ingenieros.ingenieros_votaron}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {estadisticas.ingenieros.total_ingenieros > 0 
                  ? ((estadisticas.ingenieros.ingenieros_votaron / estadisticas.ingenieros.total_ingenieros) * 100).toFixed(1) 
                  : 0}% participación
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#F59E0B' }}>
              <div className="stat-label">Pendientes</div>
              <div className="stat-value" style={{ color: '#F59E0B' }}>
                {estadisticas.ingenieros.ingenieros_pendientes}
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#EF4444' }}>
              <div className="stat-label">Votos Totales</div>
              <div className="stat-value" style={{ color: '#EF4444' }}>
                {estadisticas.votos.total_votos}
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#8B5CF6' }}>
              <div className="stat-label">Campañas Totales</div>
              <div className="stat-value" style={{ color: '#8B5CF6' }}>
                {estadisticas.campanas.total_campanas}
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#06B6D4' }}>
              <div className="stat-label">Campañas Activas</div>
              <div className="stat-value" style={{ color: '#06B6D4' }}>
                {estadisticas.campanas.campanas_activas}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Campaña */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Resultados por Campaña
        </h2>
        
        <div className="form-group">
          <label htmlFor="campana_select" className="form-label">
            Selecciona una campaña para ver resultados detallados
          </label>
          <select
            id="campana_select"
            className="form-input"
            onChange={handleCampanaChange}
            value={campanaSeleccionada?.campana_id || ''}
          >
            <option value="">-- Selecciona una campaña --</option>
            {campanas.map((campana) => (
              <option key={campana.campana_id} value={campana.campana_id}>
                {campana.titulo || campana.nombre} - {campana.total_votos} votos
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados de la Campaña Seleccionada */}
      {loadingResultados ? (
        <div className="text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando resultados...</p>
        </div>
      ) : campanaSeleccionada ? (
        <div>
          {/* Info de la Campaña */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '8px',
                  background: campanaSeleccionada.color || '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {campanaSeleccionada.logo_url ? (
                  <img 
                    src={campanaSeleccionada.logo_url} 
                    alt={campanaSeleccionada.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" style={{ width: '32px', height: '32px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {campanaSeleccionada.titulo || campanaSeleccionada.nombre}
                </h3>
                {campanaSeleccionada.descripcion && (
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {campanaSeleccionada.descripcion}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                  <span>
                    <strong>{campanaSeleccionada.total_candidatos}</strong> candidatos
                  </span>
                  <span>
                    <strong>{campanaSeleccionada.total_votos}</strong> votos emitidos
                  </span>
                  <span>
                    <strong>{campanaSeleccionada.total_votantes}</strong> votantes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados por Cargo */}
          {resultados.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: 'var(--text-tertiary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No hay resultados</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Esta campaña aún no tiene votos registrados
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '2rem' }}>
              {resultados.map((cargo) => {
                const totalVotosCargo = cargo.candidatos.reduce((sum, c) => sum + c.total_votos, 0)
                
                return (
                  <div key={cargo.cargo_id} className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                      </svg>
                      {cargo.cargo}
                      <span className="badge badge-secondary">
                        {totalVotosCargo} votos
                      </span>
                    </h3>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {cargo.candidatos.map((candidato, index) => {
                        const porcentaje = calcularPorcentaje(candidato.total_votos, totalVotosCargo)
                        const esGanador = index === 0 && candidato.total_votos > 0
                        
                        return (
                          <div 
                            key={candidato.candidato_id}
                            style={{
                              padding: '1rem',
                              background: esGanador ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                              borderRadius: '8px',
                              border: esGanador ? '2px solid #10B981' : '1px solid var(--border-color)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                  {esGanador && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#10B981" style={{ width: '24px', height: '24px' }}>
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  <span style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {index + 1}. {candidato.candidato}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                  Colegiado: {candidato.numero_colegiado}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: esGanador ? '#10B981' : 'var(--text-primary)' }}>
                                  {candidato.total_votos}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                  {porcentaje}%
                                </div>
                              </div>
                            </div>
                            
                            {/* Barra de progreso */}
                            <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: `${porcentaje}%`, 
                                  height: '100%', 
                                  background: esGanador ? '#10B981' : campanaSeleccionada.color || '#3B82F6',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: 'var(--text-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Selecciona una campaña</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Elige una campaña del selector para ver sus resultados detallados
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminReportes