// Frontend/src/App.jsx - VERSIÓN CORREGIDA
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Componentes
import Navbar from './components/Navbar'

// Páginas
import Login from './pages/Login'
import Register from './pages/Register'
import CampañasList from './pages/CampañasList'  // ✅ CON Ñ en el import
import CampañaDetalle from './pages/CampañaDetalle'  // ✅ CON Ñ en el import
import Dashboard from './pages/dashboard'  // ✅ Capitalizado

function App() {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar sesión guardada al cargar la app
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        console.log('✅ Sesión recuperada:', JSON.parse(storedUser).nombre)
      } catch (error) {
        console.error('❌ Error al parsear usuario:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  // Función para manejar el logout
  const handleLogout = () => {
    console.log('👋 Cerrando sesión...')
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Mostrar spinner mientras verifica la sesión
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        {/* Mostrar Navbar solo si hay sesión activa */}
        {token && user && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          {/* ========================================
              RUTAS PÚBLICAS (Sin autenticación)
          ======================================== */}
          
          {/* Login */}
          <Route 
            path="/" 
            element={
              token ? <Navigate to="/campanas" replace /> : <Login setToken={setToken} setUser={setUser} />
            } 
          />
          
          {/* Registro */}
          <Route 
            path="/register" 
            element={
              token ? <Navigate to="/campanas" replace /> : <Register />
            } 
          />
          
          {/* ========================================
              RUTAS PROTEGIDAS (Requieren autenticación)
          ======================================== */}
          
          {/* Lista de Campañas - SIN Ñ en la URL */}
          <Route 
            path="/campanas" 
            element={
              token ? (
                <CampañasList token={token} user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Detalle de Campaña - SIN Ñ en la URL */}
          <Route 
            path="/campana/:id" 
            element={
              token ? (
                <CampañaDetalle token={token} user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Dashboard de Resultados */}
          <Route 
            path="/dashboard" 
            element={
              token ? (
                <Dashboard token={token} user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* ========================================
              RUTAS LEGACY (Compatibilidad)
          ======================================== */}
          
          {/* Ruta antigua con Ñ - Redirige a sin Ñ */}
          <Route 
            path="/campañas" 
            element={<Navigate to="/campanas" replace />}
          />
          
          {/* Ruta antigua detalle con Ñ - Redirige a sin Ñ */}
          <Route 
            path="/campaña/:id" 
            element={<Navigate to="/campana/:id" replace />}
          />
          
          {/* Ruta antigua de votación - Redirige a campañas */}
          <Route 
            path="/votacion" 
            element={<Navigate to="/campanas" replace />}
          />
          
          {/* ========================================
              RUTA POR DEFECTO (404)
          ======================================== */}
          
          <Route 
            path="*" 
            element={<Navigate to={token ? "/campanas" : "/"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App