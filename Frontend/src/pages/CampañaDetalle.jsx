// Frontend/src/pages/CampañaDetalle.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function CampañaDetalle({ token, user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [campana, setCampana] = useState(null)
  const [votosDisponibles, setVotosDisponibles] = useState(null)
  const [misVotos, setMisVotos] = useState([])
  const [votosSeleccionados, setVotosSeleccionados] = useState({})
  const [resultados, setResultados] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [votando, setVotando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  
  const [tiempoRestante, setTiempoRestante] = useState(null)

  useEffect(() => {
  if (!token) {
    navigate('/')
    return
  }
  cargarDatosCampana()
  cargarMisVotos() // ✅ Ahora carga TODOS los votos, no solo de esta campaña
  cargarResultados()
  
  const interval = setInterval(() => {
    cargarResultados()
    cargarDatosCampana()
  }, 5000)
  
  return () => clearInterval(interval)
}, [id, token])

  // Contador de tiempo restante
  useEffect(() => {
    if (!campana?.fecha_fin) return
    
    const timer = setInterval(() => {
      const ahora = new Date()
      const fin = new Date(campana.fecha_fin)
      const diferencia = Math.max(0, fin - ahora)
      
      setTiempoRestante({
        total: diferencia,
        dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((diferencia % (1000 * 60)) / 1000)
      })
      
      // Si se acabó el tiempo, recargar datos
      if (diferencia === 0) {
        cargarDatosCampana()
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [campana?.fecha_fin])

  const cargarDatosCampana = async () => {
    try {
      // ✅ URL sin ñ
      const response = await fetch(`${API_URL}/campanas/${id}`)
      const data = await response.json()
      setCampana(data)
      
      // Cargar votos disponibles
      const votosRes = await fetch(`${API_URL}/campanas/${id}/votos-disponibles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const votosData = await votosRes.json()
      setVotosDisponibles(votosData)
      
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar campaña:', err)
      setMensaje({ tipo: 'error', texto: 'Error al cargar la campaña' })
      setLoading(false)
    }
  }

const cargarMisVotos = async () => {
  try {
    // ✅ CAMBIO: Obtener TODOS los votos del usuario (no solo de esta campaña)
    const response = await fetch(`${API_URL}/mis-votos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setMisVotos(data)
  } catch (err) {
    console.error('Error al cargar mis votos:', err)
  }
}

  const cargarResultados = async () => {
    try {
      // ✅ URL sin ñ
      const response = await fetch(`${API_URL}/campanas/${id}/resultados`)
      const data = await response.json()
      setResultados(data)
    } catch (err) {
      console.error('Error al cargar resultados:', err)
    }
  }

  const seleccionarCandidato = (cargoId, candidatoId) => {
    if (!votosDisponibles?.puede_votar || votosDisponibles?.votos_restantes === 0) return
    
    setVotosSeleccionados(prev => ({
      ...prev,
      [cargoId]: candidatoId
    }))
  }

  const handleVotar = async () => {
    if (!votosDisponibles?.puede_votar) {
      setMensaje({ tipo: 'warning', texto: 'Esta campaña no está disponible para votación' })
      return
    }

    if (Object.keys(votosSeleccionados).length === 0) {
      setMensaje({ tipo: 'warning', texto: 'Debes seleccionar al menos un candidato' })
      return
    }

    if (Object.keys(votosSeleccionados).length > votosDisponibles.votos_restantes) {
      setMensaje({ 
        tipo: 'warning', 
        texto: `Solo puedes emitir ${votosDisponibles.votos_restantes} voto(s) más` 
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
            cargo_id: parseInt(cargo_id),
            campana_id: parseInt(id)
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Error al registrar voto')
        }
      }

      setMensaje({ 
        tipo: 'success', 
        texto: '¡Votos registrados exitosamente!' 
      })
      setVotosSeleccionados({})
      
      // Recargar datos
      await cargarDatosCampana()
      await cargarMisVotos()
      await cargarResultados()

    } catch (error) {
      console.error('Error al votar:', error)
      setMensaje({ 
        tipo: 'error', 
        texto: error.message || 'Error al registrar los votos'
      })
    } finally {
      setVotando(false)
    }
  }

  const yaVoto = (cargoId) => {
  return misVotos.some(voto => voto.cargo_id === cargoId)
}

const yaVotoEnEstaCampana = (cargoId) => {
  return misVotos.some(voto => voto.cargo_id === cargoId && voto.campaña_id === parseInt(id))
}

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando campaña...</p>
        </div>
      </div>
    )
  }

  if (!campana) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span>Campaña no encontrada</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={() => navigate('/campañas')} className="btn btn-primary">
            Volver a Campañas
          </button>
        </div>
      </div>
    )
  }

  const puedeVotar = campana.esta_activa && votosDisponibles?.puede_votar

  return (
    <div className="page-container">
      {/* Header de la campaña */}
      <div className="card" style={{
        borderLeft: `6px solid ${campana.color}`,
        background: `linear-gradient(135deg, ${campana.color}100 0%, transparent 100%)`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h1 className="card-title" style={{ color: campana.color, fontSize: '2rem' }}>
              {campana.titulo || campana.nombre}
            </h1>
            <p className="card-subtitle">{campana.descripcion}</p>
          </div>
          
          <button 
            onClick={() => navigate('/campañas')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--border-radius)',
              border: `2px solid ${campana.color}`,
              background: 'transparent',
              color: campana.color,
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = campana.color
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = campana.color
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver
          </button>
        </div>

        {/* Información de votación */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--bg-tertiary)'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              🎯 Votos permitidos
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: campana.color }}>
              {campana.votos_por_votante}
            </div>
          </div>

          {votosDisponibles && (
            <>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  ✅ Votos emitidos
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981' }}>
                  {votosDisponibles.votos_emitidos}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  📊 Votos restantes
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F59E0B' }}>
                  {votosDisponibles.votos_restantes}
                </div>
              </div>
            </>
          )}

          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              👥 Total votantes
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: campana.color }}>
              {campana.total_votantes}
            </div>
          </div>
        </div>

        {/* Contador de tiempo */}
        {tiempoRestante && tiempoRestante.total > 0 && puedeVotar && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            background: `${campana.color}15`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={campana.color} style={{ width: '32px', height: '32px', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '1.25rem', color: campana.color, marginBottom: '0.25rem' }}>
                ⏱️ Tiempo Restante
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                <span><strong>{tiempoRestante.dias}</strong> días</span>
                <span><strong>{tiempoRestante.horas}</strong> horas</span>
                <span><strong>{tiempoRestante.minutos}</strong> minutos</span>
                <span><strong>{tiempoRestante.segundos}</strong> segundos</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
            {mensaje.tipo === 'success' && (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            )}
            {mensaje.tipo === 'error' && (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            )}
            {mensaje.tipo === 'warning' && (
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            )}
          </svg>
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Candidatos por cargo */}
      {campana.cargos && campana.cargos.length > 0 ? (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {campana.cargos.map((cargo) => {
            const votoEmitido = yaVoto(cargo.cargo_id)
            const candidatoSeleccionado = votosSeleccionados[cargo.cargo_id]

            return (
              <div key={cargo.cargo_id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 className="card-title" style={{ fontSize: '1.5rem', color: campana.color }}>
                    {cargo.cargo_nombre}
                  </h2>
                  {votoEmitido && (
                    <div style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      background: '#10B98120',
                      color: '#10B981',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Ya votaste
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {cargo.candidatos.map((candidato) => {
  const seleccionado = candidatoSeleccionado === candidato.id
  const yaVotoEnCargo = yaVoto(cargo.cargo_id) // ✅ Ya votó en este cargo en cualquier campaña
  const esVotoDeEstaCampana = yaVotoEnEstaCampana(cargo.cargo_id) // ✅ Votó en esta campaña
  const deshabilitado = !puedeVotar || (yaVotoEnCargo && !esVotoDeEstaCampana)

  return (
    <div
      key={candidato.id}
      onClick={() => !deshabilitado && seleccionarCandidato(cargo.cargo_id, candidato.id)}
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--border-radius)',
        border: seleccionado ? `3px solid ${campana.color}` : '2px solid var(--bg-tertiary)',
        background: seleccionado 
          ? `${campana.color}10` 
          : yaVotoEnCargo 
            ? 'var(--bg-tertiary)' 
            : 'var(--bg-secondary)',
        cursor: deshabilitado ? 'not-allowed' : 'pointer',
        opacity: deshabilitado ? 0.6 : 1,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!deshabilitado) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* ✅ NUEVO: Indicador de voto en otro lado */}
      {yaVotoEnCargo && !esVotoDeEstaCampana && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          background: '#F59E0B20',
          color: '#F59E0B',
          fontSize: '0.75rem',
          fontWeight: '700'
        }}>
          ✓ Ya votaste en este cargo
        </div>
      )}

      {/* Foto del candidato */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: candidato.foto_url 
          ? `url(${candidato.foto_url}) center/cover` 
          : `linear-gradient(135deg, ${campana.color} 0%, ${campana.color}CC 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem',
        fontWeight: '700',
        flexShrink: 0,
        border: seleccionado ? `4px solid ${campana.color}` : 'none'
      }}>
        {!candidato.foto_url && candidato.nombre.charAt(0)}
      </div>

      {/* Información del candidato */}
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          {candidato.nombre}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            📋 Colegiado: <strong>{candidato.numero_colegiado}</strong>
          </span>
          {candidato.especialidad && (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              🎓 {candidato.especialidad}
            </span>
          )}
          {!puedeVotar && (
            <span style={{ fontSize: '0.9rem', color: campana.color, marginTop: '0.5rem' }}>
              📊 {candidato.total_votos} votos
            </span>
          )}
        </div>
      </div>

      {/* Indicador de selección */}
      {seleccionado && (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: campana.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" style={{ width: '24px', height: '24px' }}>
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
})}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <span>No hay candidatos registrados para esta campaña</span>
          </div>
        </div>
      )}

      {/* Botón de votar */}
      {puedeVotar && Object.keys(votosSeleccionados).length > 0 && (
        <div style={{ 
          position: 'sticky', 
          bottom: '2rem', 
          zIndex: 10,
          marginTop: '2rem'
        }}>
          <div className="card" style={{
            padding: '1.5rem',
            background: `linear-gradient(135deg, ${campana.color} 0%, ${campana.color}CC 100%)`,
            border: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: '1rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                  {Object.keys(votosSeleccionados).length} candidato(s) seleccionado(s)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  ¿Confirmar votos?
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setVotosSeleccionados({})}
                  disabled={votando}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: 'var(--border-radius)',
                    border: '2px solid white',
                    background: 'transparent',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1rem',
                    cursor: votando ? 'not-allowed' : 'pointer',
                    opacity: votando ? 0.6 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!votando) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={handleVotar}
                  disabled={votando}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: 'var(--border-radius)',
                    border: 'none',
                    background: 'white',
                    color: campana.color,
                    fontWeight: '700',
                    fontSize: '1rem',
                    cursor: votando ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!votando) {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {votando ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: `${campana.color} transparent ${campana.color} transparent` }}></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '24px', height: '24px' }}>
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Confirmar Votos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mis votos emitidos */}
      {misVotos.length > 0 && (
  <div className="card">
    <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
      📝 Mis Votos Emitidos ({misVotos.length}/7)
    </h2>
    <div style={{ display: 'grid', gap: '1rem' }}>
      {misVotos.map((voto, index) => (
        <div
          key={index}
          style={{
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            background: 'var(--bg-secondary)',
            border: `2px solid ${voto.campana_color}40`,
            borderLeft: `4px solid ${voto.campana_color}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ 
                fontWeight: '700', 
                color: 'var(--text-primary)'
              }}>
                {voto.cargo}
              </div>
              {voto.campaña_id === parseInt(id) && (
                <div style={{
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  background: `${campana.color}20`,
                  color: campana.color,
                  fontSize: '0.7rem',
                  fontWeight: '700'
                }}>
                  Esta campaña
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Votaste por: <strong style={{ color: voto.campana_color }}>{voto.candidato}</strong>
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-tertiary)',
              marginTop: '0.25rem'
            }}>
              Campaña: {voto.campana}
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={voto.campana_color} style={{ width: '24px', height: '24px' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
        </div>
      ))}
    </div>
    
    {misVotos.length < 7 && (
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        borderRadius: 'var(--border-radius)',
        background: '#F59E0B20',
        color: '#F59E0B',
        textAlign: 'center',
        fontWeight: '600'
      }}>
        Te quedan {7 - misVotos.length} voto(s) por emitir
      </div>
    )}
  </div>
)}

      {/* Resultados en tiempo real */}
      {!puedeVotar && resultados.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="card-title" style={{ fontSize: '1.5rem' }}>
              📊 Resultados en Tiempo Real
            </h2>
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              background: `${campana.color}20`,
              color: campana.color,
              fontSize: '0.875rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Actualización automática
            </div>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            {resultados.map((cargo, index) => {
              const candidatos = cargo.candidatos.filter(c => c.candidato)
              const totalVotos = candidatos.reduce((sum, c) => sum + parseInt(c.total_votos), 0)
              const ganador = candidatos.reduce((prev, current) => 
                parseInt(current.total_votos) > parseInt(prev.total_votos) ? current : prev
              , candidatos[0])

              return (
                <div key={index}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    color: campana.color,
                    marginBottom: '1rem'
                  }}>
                    {cargo.cargo}
                  </h3>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {candidatos.map((candidato, idx) => {
                      const votos = parseInt(candidato.total_votos)
                      const porcentaje = totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(1) : 0
                      const esGanador = ganador && candidato.candidato === ganador.candidato && totalVotos > 0

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--border-radius)',
                            background: esGanador ? `${campana.color}15` : 'var(--bg-secondary)',
                            border: esGanador ? `2px solid ${campana.color}` : '2px solid var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          {esGanador && (
                            <div style={{ fontSize: '2rem' }}>🏆</div>
                          )}
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '700', color: esGanador ? campana.color : 'var(--text-primary)' }}>
                                {candidato.candidato}
                              </span>
                              <span style={{ fontWeight: '700', color: campana.color }}>
                                {votos} votos ({porcentaje}%)
                              </span>
                            </div>
                            
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
                                background: esGanador ? campana.color : '#6B7280',
                                transition: 'width 0.5s ease'
                              }}></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {totalVotos > 0 && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      padding: '0.75rem', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: 'var(--border-radius)',
                      textAlign: 'right',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      Total de votos: <strong style={{ color: campana.color }}>{totalVotos}</strong>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Botón para actualizar resultados manualmente */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={() => {
            cargarDatosCampana()
            cargarMisVotos()
            cargarResultados()
          }}
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
          Actualizar Datos
        </button>
      </div>
    </div>
  )
}

export default CampañaDetalle