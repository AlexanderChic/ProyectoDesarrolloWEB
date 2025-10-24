// Frontend/src/App.jsx - CON RUTAS ADMIN
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Componentes
import Navbar from './components/Navbar'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

// Páginas Públicas
import Login from './pages/Login'
import Register from './pages/Register'

// Páginas de Usuario
import CampañasList from './pages/CampañasList'
import CampañaDetalle from './pages/CampañaDetalle'
import Dashboard from './pages/dashboard'

// Páginas de Admin 
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCampanas from './pages/admin/estadísticas/AdminCampanas'
import AdminCampanaForm from './pages/admin/estadísticas/AdminCampanaForm'
import AdminCandidatos from './pages/admin/campaña/AdminCandidatos'
import AdminReportes from './pages/admin/campaña/AdminReportes'

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
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        console.log('✅ Sesión recuperada:', parsedUser.nombre, '| Admin:', parsedUser.es_admin || parsedUser.rol === 'admin')
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
          
          {/* Login - Redirige según rol */}
          <Route 
            path="/" 
            element={
              token ? (
                user?.es_admin || user?.rol === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/campanas" replace />
                )
              ) : (
                <Login setToken={setToken} setUser={setUser} />
              )
            } 
          />
          
          {/* Registro */}
          <Route 
            path="/register" 
            element={
              token ? (
                user?.es_admin || user?.rol === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/campanas" replace />
                )
              ) : (
                <Register />
              )
            } 
          />
          
          {/* ========================================
              RUTAS PROTEGIDAS - USUARIO
          ======================================== */}
          
          {/* Lista de Campañas */}
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
          
          {/* Detalle de Campaña */}
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
              RUTAS PROTEGIDAS - ADMINISTRADOR
          ======================================== */}
          
          {/* Dashboard Admin */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute user={user}>
                <AdminDashboard token={token} user={user} />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Gestión de Campañas */}
          <Route 
            path="/admin/campanas" 
            element={
              <ProtectedAdminRoute user={user}>
                <AdminCampanas token={token} user={user} />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Crear/Editar Campaña */}
          <Route 
            path="/admin/campanas/nueva" 
            element={
              <ProtectedAdminRoute user={user}>
                <AdminCampanaForm token={token} user={user} />
              </ProtectedAdminRoute>
            } 
          />
          
          <Route 
            path="/admin/campanas/editar/:id" 
            element={
              <ProtectedAdminRoute user={user}>
                <AdminCampanaForm token={token} user={user} />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Gestión de Candidatos */}
          <Route 
            path="/admin/candidatos/:campanaId" 
            element={
              <ProtectedAdminRoute user={user}>
                <AdminCandidatos token={token} user={user} />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Reportes Admin */}
          <Route 
            path="/admin/reportes" 
            element={
              <ProtectedAdminRoute user={user}>
                <AdminReportes token={token} user={user} />
              </ProtectedAdminRoute>
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
          
          {/* Ruta antigua detalle con Ñ */}
          <Route 
            path="/campaña/:id" 
            element={<Navigate to="/campana/:id" replace />}
          />
          
          {/* Ruta antigua de votación */}
          <Route 
            path="/votacion" 
            element={<Navigate to="/campanas" replace />}
          />
          
          {/* ========================================
              RUTA POR DEFECTO (404)
          ======================================== */}
          
          <Route 
            path="*" 
            element={
              <Navigate 
                to={
                  token ? (
                    user?.es_admin || user?.rol === 'admin' 
                      ? "/admin/dashboard" 
                      : "/campanas"
                  ) : "/"
                } 
                replace 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App