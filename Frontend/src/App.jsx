import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import CampañasList from './pages/CampañasList'
import CampañaDetalle from './pages/CampañaDetalle'
import Dashboard from './pages/Dashboard'

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
      } catch (error) {
        console.error('Error al parsear usuario:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  // Función para manejar el logout
  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Mostrar spinner mientras verifica la sesión
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
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
          {/* Rutas públicas (Login y Registro) */}
          <Route 
            path="/" 
            element={
              token ? <Navigate to="/campañas" replace /> : <Login setToken={setToken} setUser={setUser} />
            } 
          />
          
          <Route 
            path="/register" 
            element={
              token ? <Navigate to="/campañas" replace /> : <Register />
            } 
          />
          
          {/* Rutas protegidas */}
          <Route 
            path="/campañas" 
            element={
              token ? (
                <CampañasList token={token} user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          <Route 
            path="/campaña/:id" 
            element={
              token ? (
                <CampañaDetalle token={token} user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          <Route 
            path="/votacion" 
            element={
              token ? (
                <Navigate to="/campañas" replace />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
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
          
          {/* Ruta por defecto - redirección */}
          <Route 
            path="*" 
            element={<Navigate to={token ? "/campañas" : "/"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App