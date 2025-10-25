// Frontend/src/pages/admin/campaña/AdminCandidatos.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function AdminCandidatos({ token }) {
  const { campanaId } = useParams()
  
  const [campana, setCampana] = useState(null)
  const [candidatos, setCandidatos] = useState([])
  const [cargos, setCargos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Estado del modal
  const [showModal, setShowModal] = useState(false)
  const [editingCandidato, setEditingCandidato] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    numero_colegiado: '',
    cargo_id: '',
    numero_orden: 1,
    especialidad: '',
    foto_url: ''
  })

  useEffect(() => {
    fetchData()
  }, [campanaId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener información de la campaña
      const campanaResponse = await fetch(`${API_URL}/campanas/${campanaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!campanaResponse.ok) {
        throw new Error('Error al obtener campaña')
      }
      
      const campanaData = await campanaResponse.json()
      setCampana(campanaData)

      // Obtener candidatos
      const candidatosResponse = await fetch(`${API_URL}/campanas/${campanaId}/candidatos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!candidatosResponse.ok) {
        throw new Error('Error al obtener candidatos')
      }
      
      const candidatosData = await candidatosResponse.json()
      setCandidatos(candidatosData)

      // Obtener cargos disponibles
      const cargosResponse = await fetch(`${API_URL}/cargos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!cargosResponse.ok) {
        throw new Error('Error al obtener cargos')
      }
      
      const cargosData = await cargosResponse.json()
      setCargos(cargosData)

      console.log('✅ Datos cargados:', {
        campana: campanaData.nombre,
        candidatos: candidatosData.length,
        cargos: cargosData.length
      })
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (candidato = null) => {
    if (candidato) {
      // Modo edición
      setEditingCandidato(candidato)
      setFormData({
        nombre: candidato.nombre,
        numero_colegiado: candidato.numero_colegiado,
        cargo_id: candidato.cargo_id,
        numero_orden: candidato.numero_orden,
        especialidad: candidato.especialidad || '',
        foto_url: candidato.foto_url || ''
      })
    } else {
      // Modo creación
      setEditingCandidato(null)
      setFormData({
        nombre: '',
        numero_colegiado: '',
        cargo_id: cargos[0]?.id || '',
        numero_orden: candidatos.length + 1,
        especialidad: '',
        foto_url: ''
      })
    }
    setShowModal(true)
    setError('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCandidato(null)
    setFormData({
      nombre: '',
      numero_colegiado: '',
      cargo_id: '',
      numero_orden: 1,
      especialidad: '',
      foto_url: ''
    })
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

    if (!formData.nombre || !formData.numero_colegiado || !formData.cargo_id) {
      setError('Por favor completa los campos obligatorios')
      return
    }

    try {
      const url = editingCandidato 
        ? `${API_URL}/candidatos/${editingCandidato.id}`
        : `${API_URL}/candidatos`
      
      const method = editingCandidato ? 'PUT' : 'POST'
      
      const payload = editingCandidato 
        ? formData 
        : { ...formData, campaña_id: parseInt(campanaId) }

      console.log(`${editingCandidato ? '✏️ Editando' : '➕ Creando'} candidato:`, payload)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar candidato')
      }

      console.log('✅ Candidato guardado:', data)
      setSuccessMessage(
        editingCandidato 
          ? 'Candidato actualizado exitosamente' 
          : 'Candidato creado exitosamente'
      )
      
      setTimeout(() => setSuccessMessage(''), 3000)
      
      handleCloseModal()
      fetchData()

    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    }
  }

  const handleEliminar = async (candidatoId, nombreCandidato) => {
    if (!confirm(`¿Estás seguro de eliminar al candidato "${nombreCandidato}"?\n\nEsto también eliminará todos sus votos.`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/candidatos/${candidatoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al eliminar candidato')
      }

      setSuccessMessage('Candidato eliminado exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      fetchData()
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    }
  }

  // Agrupar candidatos por cargo
  const candidatosPorCargo = candidatos.reduce((acc, candidato) => {
    const cargoId = candidato.cargo_id
    if (!acc[cargoId]) {
      acc[cargoId] = {
        cargo_id: cargoId,
        cargo_nombre: candidato.cargo_nombre,
        cargo_orden: candidato.cargo_orden,
        candidatos: []
      }
    }
    acc[cargoId].candidatos.push(candidato)
    return acc
  }, {})

  const cargosOrdenados = Object.values(candidatosPorCargo).sort((a, b) => a.cargo_orden - b.cargo_orden)

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando candidatos...</p>
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
            Volver a Campañas
          </Link>
          <h1 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '2rem', height: '2rem', color: 'var(--primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            Gestión de Candidatos
          </h1>
        </div>
        {campana && (
          <p className="card-subtitle">
            Campaña: <strong>{campana.titulo || campana.nombre}</strong>
            <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
              {candidatos.length} candidatos
            </span>
          </p>
        )}
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

      {/* Botón Agregar Candidato */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
          Agregar Candidato
        </button>
      </div>

      {/* Lista de Candidatos por Cargo */}
      {cargosOrdenados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: 'var(--text-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No hay candidatos</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Agrega candidatos a esta campaña
          </p>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            Agregar Primer Candidato
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {cargosOrdenados.map((cargo) => (
            <div key={cargo.cargo_id} className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
                {cargo.cargo_nombre}
                <span className="badge badge-secondary">
                  {cargo.candidatos.length}
                </span>
              </h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {cargo.candidatos.map((candidato) => (
                  <div 
                    key={candidato.id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {/* Foto */}
                    <div 
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: campana?.color || '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {candidato.foto_url ? (
                        <img 
                          src={candidato.foto_url} 
                          alt={candidato.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" style={{ width: '32px', height: '32px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {candidato.numero_orden}. {candidato.nombre}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Colegiado: <strong>{candidato.numero_colegiado}</strong>
                        {candidato.especialidad && (
                          <> • {candidato.especialidad}</>
                        )}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Votos: <strong>{candidato.total_votos || 0}</strong>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleOpenModal(candidato)}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleEliminar(candidato.id, candidato.nombre)}
                        className="btn btn-danger btn-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Agregar/Editar Candidato */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={handleCloseModal}
        >
          <div 
            className="card"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {editingCandidato ? 'Editar Candidato' : 'Agregar Candidato'}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {editingCandidato 
                  ? 'Modifica la información del candidato' 
                  : 'Completa los datos del nuevo candidato'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="form-input"
                    placeholder="Juan Pérez García"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

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
                </div>

                <div className="form-group">
                  <label htmlFor="cargo_id" className="form-label">
                    Cargo *
                  </label>
                  <select
                    id="cargo_id"
                    name="cargo_id"
                    className="form-input"
                    value={formData.cargo_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un cargo</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id} value={cargo.id}>
                        {cargo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="numero_orden" className="form-label">
                    Número de Orden *
                  </label>
                  <input
                    type="number"
                    id="numero_orden"
                    name="numero_orden"
                    className="form-input"
                    min="1"
                    value={formData.numero_orden}
                    onChange={handleChange}
                    required
                  />
                  <small style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Orden de aparición en la papeleta
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="especialidad" className="form-label">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    id="especialidad"
                    name="especialidad"
                    className="form-input"
                    placeholder="Ingeniería Civil"
                    value={formData.especialidad}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="foto_url" className="form-label">
                    URL de Foto
                  </label>
                  <input
                    type="url"
                    id="foto_url"
                    name="foto_url"
                    className="form-input"
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={formData.foto_url}
                    onChange={handleChange}
                  />
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {editingCandidato ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCandidatos