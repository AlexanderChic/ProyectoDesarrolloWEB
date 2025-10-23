import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

const API_URL = 'http://localhost:5000'

function Votacion({ token, user }) {
  const navigate = useNavigate()
  const [cargos, setCargos] = useState([])
  const [candidatosPorCargo, setCandidatosPorCargo] = useState({})
  const [votosSeleccionados, setVotosSeleccionados] = useState({})
  const [loading, setLoading] = useState(true)
  const [votando, setVotando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [misVotos, setMisVotos] = useState([])
  const [yaVoto, setYaVoto] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    cargarDatos()
    verificarSiYaVoto()
  }, [token])

  const cargarDatos = async () => {
    try {
      // Cargar cargos
      const resCargos = await fetch(`${API_URL}/cargos`)
      const dataCargos = await resCargos.json()
      setCargos(dataCargos)

      // Cargar candidatos con info de campaña
      const candidatosTemp = {}
      for (const cargo of dataCargos) {
        const resCandidatos = await fetch(`${API_URL}/candidatos/cargo/${cargo.id}`)
        const dataCandidatos = await resCandidatos.json()
        candidatosTemp[cargo.id] = dataCandidatos
      }
      setCandidatosPorCargo(candidatosTemp)
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setMensaje({ tipo: 'error', texto: 'Error al cargar los datos de votación' })
      setLoading(false)
    }
  }

  const verificarSiYaVoto = async () => {
    try {
      const response = await fetch(`${API_URL}/votos/ingeniero/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.length > 0) {
        setYaVoto(true)
        setMisVotos(data)
      }
    } catch (err) {
      console.error('Error al verificar votos:', err)
    }
  }

  const seleccionarCandidato = (cargoId, candidatoId) => {
    if (yaVoto) return

    setVotosSeleccionados(prev => ({
      ...prev,
      [cargoId]: candidatoId
    }))
  }

  const handleVotar = async () => {
    if (yaVoto) {
      setMensaje({ tipo: 'warning', texto: 'Ya has votado anteriormente' })
      return
    }

    if (Object.keys(votosSeleccionados).length !== cargos.length) {
      setMensaje({ 
        tipo: 'warning', 
        texto: 'Debes seleccionar un candidato para todos los cargos de la Junta Directiva' 
      })
      return
    }

    setVotando(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      for (const [cargo_id, candidato_id] of Object.entries(votosSeleccionados)) {
        const response = await fetch(`${API_URL}/votos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            candidato_id: parseInt(candidato_id),
            cargo_id: parseInt(cargo_id)
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Error al registrar voto')
        }
      }

      setMensaje({ 
        tipo: 'success', 
        texto: '¡Votación completada exitosamente! Gracias por participar.' 
      })
      setYaVoto(true)
      setVotosSeleccionados({})
      
      setTimeout(() => {
        verificarSiYaVoto()
      }, 1000)

    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setVotando(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando papeleta de votación...</p>
        </div>
      </div>
    )
  }

  if (yaVoto && misVotos.length > 0) {
    return (
      <div className="page-container">
        <div className="card">
          <div className="card-header text-center">
            <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', color: 'var(--secondary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h1 className="card-title" style={{ color: 'var(--secondary)' }}>¡Ya has votado!</h1>
            <p className="card-subtitle">Gracias por participar en la elección de la Junta Directiva</p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Resumen de tus votos:</h3>
            {misVotos.map((voto, index) => (
              <div key={index} className="resultado-item" style={{ 
                borderLeft: `4px solid ${voto.campaña_color || '#3B82F6'}` 
              }}>
                <div className="resultado-info">
                  <div className="resultado-nombre">{voto.cargo}</div>
                  <div className="resultado-partido">{voto.candidato}</div>
                  {voto.campaña && (
                    <div style={{ 
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      backgroundColor: voto.campaña_color + '20',
                      color: voto.campaña_color || '#3B82F6'
                    }}>
                      {voto.campaña}
                    </div>
                  )}
                </div>
                <div style={{ color: 'var(--secondary)', fontWeight: '600' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '24px', height: '24px' }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              Ver Resultados
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Elección de Junta Directiva</h1>
          <p className="card-subtitle">
            Selecciona un candidato para cada cargo. Los candidatos están agrupados por campaña.
          </p>
        </div>

        {mensaje.texto && (
          <div className={`alert alert-${mensaje.tipo}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
              {mensaje.tipo === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              )}
            </svg>
            <span>{mensaje.texto}</span>
          </div>
        )}

        {cargos.length === 0 ? (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <span>No hay cargos disponibles para votar en este momento.</span>
          </div>
        ) : (
          <>
            {cargos.map((cargo) => (
              <div key={cargo.id} className="categoria-card">
                <h2 className="categoria-title">
                  {cargo.nombre}
                  {cargo.descripcion && (
                    <span style={{ fontSize: '0.9rem', fontWeight: '400', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                      - {cargo.descripcion}
                    </span>
                  )}
                </h2>

                {candidatosPorCargo[cargo.id]?.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                    No hay candidatos disponibles para este cargo
                  </p>
                ) : (
                  <div className="candidatos-grid">
                    {candidatosPorCargo[cargo.id]?.map((candidato) => (
                      <div
                        key={candidato.id}
                        className={`candidato-card ${votosSeleccionados[cargo.id] === candidato.id ? 'selected' : ''}`}
                        onClick={() => seleccionarCandidato(cargo.id, candidato.id)}
                        style={{
                          borderTop: candidato.campaña_color ? `4px solid ${candidato.campaña_color}` : undefined,
                          cursor: 'pointer'
                        }}
                      >
                        {/* Badge de campaña */}
                        {candidato.campaña_nombre && (
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            backgroundColor: candidato.campaña_color + '20',
                            color: candidato.campaña_color || '#3B82F6'
                          }}>
                            {candidato.campaña_nombre}
                          </div>
                        )}

                        <div className="candidato-numero">
                          #{candidato.numero_orden}
                        </div>
                        <div className="candidato-nombre">
                          {candidato.nombre}
                        </div>
                        <div className="candidato-partido">
                          Colegiado: {candidato.numero_colegiado}
                        </div>
                        {candidato.especialidad && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {candidato.especialidad}
                          </div>
                        )}
                        {votosSeleccionados[cargo.id] === candidato.id && (
                          <div style={{ 
                            marginTop: '0.75rem', 
                            color: candidato.campaña_color || 'var(--primary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontWeight: '600' 
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            Seleccionado
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {cargos.length > 0 && (
              <div className="votar-button">
                <button
                  onClick={handleVotar}
                  className="btn btn-success btn-block btn-lg"
                  disabled={votando || Object.keys(votosSeleccionados).length !== cargos.length}
                >
                  {votando ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                      Enviando votos...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                      Confirmar Votos ({Object.keys(votosSeleccionados).length}/{cargos.length})
                    </>
                  )}
                </button>
                {Object.keys(votosSeleccionados).length < cargos.length && (
                  <p style={{ textAlign: 'center', marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Selecciona un candidato para todos los cargos
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Votacion