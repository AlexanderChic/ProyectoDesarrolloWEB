//Frontend/src/pages/dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

const API_URL = 'http://localhost:5000'

function Dashboard({ token }) {
  const navigate = useNavigate()
  const [estadisticas, setEstadisticas] = useState(null)
  const [resultados, setResultados] = useState([])
  const [resultadosCampañas, setResultadosCampañas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vistaActual, setVistaActual] = useState('cargos') // 'cargos' o 'campañas'

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    cargarDatos()
  }, [token])

  const cargarDatos = async () => {
    try {
      // Estadísticas generales
      const resEstadisticas = await fetch(`${API_URL}/reportes/estadisticas`)
      const dataEstadisticas = await resEstadisticas.json()
      setEstadisticas(dataEstadisticas)

      // Resultados por cargo
      const resResultados = await fetch(`${API_URL}/reportes/resultados`)
      const dataResultados = await resResultados.json()
      const resultadosAgrupados = agruparPorCargo(dataResultados)
      setResultados(resultadosAgrupados)

      // Resultados por campaña
      const resCampañas = await fetch(`${API_URL}/reportes/resultados-por-campaña`)
      const dataCampañas = await resCampañas.json()
      setResultadosCampañas(dataCampañas)
      
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los resultados')
      setLoading(false)
    }
  }

  const agruparPorCargo = (datos) => {
    const agrupado = {}
    
    datos.forEach(item => {
      if (!agrupado[item.cargo]) {
        agrupado[item.cargo] = []
      }
      if (item.candidato) {
        agrupado[item.cargo].push(item)
      }
    })
    
    return agrupado
  }

  const calcularPorcentaje = (votos, total) => {
    if (total === 0) return 0
    return ((votos / total) * 100).toFixed(1)
  }

  const obtenerTotalVotosPorCargo = (candidatos) => {
    return candidatos.reduce((sum, c) => sum + parseInt(c.total_votos || 0), 0)
  }

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando resultados...</p>
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
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Estadísticas generales */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Resultados de la Elección</h1>
          <p className="card-subtitle">Junta Directiva - Colegio de Ingenieros de Guatemala</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
            <div className="stat-label">Total de Ingenieros</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              {estadisticas?.ingenieros?.total_ingenieros || 0}
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
            <div className="stat-label">Han Votado</div>
            <div className="stat-value" style={{ color: 'var(--secondary)' }}>
              {estadisticas?.ingenieros?.ingenieros_votaron || 0}
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
            <div className="stat-label">Pendientes</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>
              {estadisticas?.ingenieros?.ingenieros_pendientes || 0}
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--info)' }}>
            <div className="stat-label">Total de Votos</div>
            <div className="stat-value" style={{ color: 'var(--info)' }}>
              {estadisticas?.votos?.total_votos || 0}
            </div>
          </div>
        </div>

        {/* Barra de participación */}
        {estadisticas?.ingenieros && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Participación Electoral</span>
              <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                {calcularPorcentaje(
                  estadisticas.ingenieros.ingenieros_votaron,
                  estadisticas.ingenieros.total_ingenieros
                )}%
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '24px', 
              background: 'var(--bg-tertiary)', 
              borderRadius: 'var(--border-radius)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${calcularPorcentaje(
                  estadisticas.ingenieros.ingenieros_votaron,
                  estadisticas.ingenieros.total_ingenieros
                )}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Selector de vista */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--bg-tertiary)' }}>
          <button
            onClick={() => setVistaActual('cargos')}
            style={{
              flex: 1,
              padding: '1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: vistaActual === 'cargos' ? '3px solid var(--primary)' : 'none',
              color: vistaActual === 'cargos' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📊 Resultados por Cargo
          </button>
          <button
            onClick={() => setVistaActual('campañas')}
            style={{
              flex: 1,
              padding: '1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: vistaActual === 'campañas' ? '3px solid var(--primary)' : 'none',
              color: vistaActual === 'campañas' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🎯 Resultados por Campaña
          </button>
        </div>
      </div>

      {/* Vista de resultados por cargos */}
      {vistaActual === 'cargos' && (
        <>
          {Object.keys(resultados).length === 0 ? (
            <div className="card">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                <span>Aún no hay votos registrados</span>
              </div>
            </div>
          ) : (
            Object.entries(resultados).map(([cargo, candidatos]) => {
              const totalVotos = obtenerTotalVotosPorCargo(candidatos)
              const ganador = candidatos.reduce((prev, current) => 
                (parseInt(current.total_votos) > parseInt(prev.total_votos)) ? current : prev
              )

              return (
                <div key={cargo} className="card resultados-categoria">
                  <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                    {cargo}
                  </h2>

                  {candidatos.map((candidato, index) => {
                    const votos = parseInt(candidato.total_votos || 0)
                    const porcentaje = calcularPorcentaje(votos, totalVotos)
                    const esGanador = candidato.candidato === ganador.candidato

                    return (
                      <div 
                        key={index} 
                        className="resultado-item"
                        style={esGanador ? { 
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                          borderLeft: `4px solid ${candidato.campaña_color || 'var(--secondary)'}`
                        } : {
                          borderLeft: candidato.campaña_color ? `4px solid ${candidato.campaña_color}` : undefined
                        }}
                      >
                        <div className="resultado-info" style={{ flex: '1' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <div className="resultado-nombre">
                              {candidato.candidato}
                            </div>
                            {esGanador && totalVotos > 0 && (
                              <div style={{ 
                                background: 'var(--secondary)', 
                                color: 'white', 
                                padding: '0.125rem 0.5rem', 
                                borderRadius: '9999px', 
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}>
                                GANADOR
                              </div>
                            )}
                            {candidato.campaña && (
                              <div style={{ 
                                backgroundColor: candidato.campaña_color + '20',
                                color: candidato.campaña_color || '#3B82F6',
                                padding: '0.125rem 0.5rem', 
                                borderRadius: '9999px', 
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}>
                                {candidato.campaña}
                              </div>
                            )}
                          </div>
                          <div className="resultado-partido" style={{ marginBottom: '0.25rem' }}>
                            Colegiado: {candidato.numero_colegiado}
                          </div>
                          {candidato.especialidad && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                              {candidato.especialidad}
                            </div>
                          )}
                          
                          {/* Barra de progreso */}
                          <div style={{ 
                            width: '100%', 
                            height: '8px', 
                            background: 'var(--bg-tertiary)', 
                            borderRadius: '9999px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${porcentaje}%`, 
                              height: '100%', 
                              background: candidato.campaña_color || (esGanador ? 'var(--secondary)' : 'var(--primary)'),
                              transition: 'width 0.5s ease'
                            }}></div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                          <div className="resultado-votos">
                            {votos}
                          </div>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            marginTop: '0.25rem'
                          }}>
                            {porcentaje}%
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: 'var(--border-radius)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Total de votos para este cargo:
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary)' }}>
                      {totalVotos}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </>
      )}

      {/* Vista de resultados por campañas */}
      {vistaActual === 'campañas' && (
        <div className="card">
          <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Resumen por Campaña
          </h2>

          {resultadosCampañas.length === 0 ? (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              <span>No hay campañas registradas</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {resultadosCampañas.map((campaña, index) => {
                const totalVotosGeneral = resultadosCampañas.reduce((sum, c) => sum + parseInt(c.total_votos || 0), 0)
                const porcentajeGeneral = calcularPorcentaje(campaña.total_votos, totalVotosGeneral)

                return (
                  <div 
                    key={index}
                    style={{
                      padding: '1.5rem',
                      borderRadius: 'var(--border-radius)',
                      border: '2px solid var(--bg-tertiary)',
                      borderLeft: `6px solid ${campaña.campaña_color || '#3B82F6'}`,
                      background: `linear-gradient(135deg, ${campaña.campaña_color}10 0%, transparent 100%)`,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: '700', 
                          color: campaña.campaña_color || 'var(--text-primary)',
                          marginBottom: '0.5rem'
                        }}>
                          {campaña.campaña}
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          <span>👥 {campaña.total_candidatos} candidatos</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '2.5rem', 
                          fontWeight: '700', 
                          color: campaña.campaña_color || 'var(--primary)',
                          lineHeight: '1'
                        }}>
                          {campaña.total_votos}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          votos totales
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          Participación en votos totales
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: campaña.campaña_color || 'var(--primary)' }}>
                          {porcentajeGeneral}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        background: 'var(--bg-tertiary)', 
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${porcentajeGeneral}%`, 
                          height: '100%', 
                          background: `linear-gradient(90deg, ${campaña.campaña_color || 'var(--primary)'} 0%, ${campaña.campaña_color || 'var(--primary)'}CC 100%)`,
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Botón para actualizar */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={cargarDatos} 
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
          Actualizar Resultados
        </button>
      </div>
    </div>
  )
}

export default Dashboard