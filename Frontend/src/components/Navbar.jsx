// Frontend/src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'
import '../App.css'

function Navbar({ user, onLogout }) {
  const location = useLocation()
  
  // Verificar si el usuario es admin
  const esAdmin = user?.es_admin || user?.rol === 'admin'

  // Función para verificar si la ruta está activa
  const isActiveRoute = (path) => {
    if (path === '/campanas') {
      return location.pathname === '/campanas' || 
             location.pathname.startsWith('/campana/')
    }
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard'
    }
    if (path === '/admin/campanas') {
      return location.pathname === '/admin/campanas' || 
             location.pathname.startsWith('/admin/campanas/') ||
             location.pathname.startsWith('/admin/candidatos/')
    }
    if (path === '/admin/reportes') {
      return location.pathname === '/admin/reportes'
    }
    return location.pathname === path
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* ========================================
            LOGO Y MARCA
        ======================================== */}
        <Link 
          to={esAdmin ? "/admin/dashboard" : "/campanas"} 
          className="navbar-brand"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" 
            />
          </svg>
          <span>
            Colegio de Ingenieros GT
            {esAdmin && <span style={{ 
              marginLeft: '0.5rem', 
              fontSize: '0.75rem', 
              padding: '0.25rem 0.5rem', 
              background: '#EF4444', 
              borderRadius: '4px',
              fontWeight: '600'
            }}>ADMIN</span>}
          </span>
        </Link>

        {/* ========================================
            MENÚ DE NAVEGACIÓN
        ======================================== */}
        <div className="navbar-menu">
          
          {esAdmin ? (
            /* ========================================
               MENÚ PARA ADMINISTRADOR
            ======================================== */
            <>
              {/* Dashboard Admin */}
              <Link 
                to="/admin/dashboard" 
                className={`navbar-link ${isActiveRoute('/admin/dashboard') ? 'active' : ''}`}
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
                    d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" 
                  />
                </svg>
                Dashboard
              </Link>

              {/* Gestión de Campañas */}
              <Link 
                to="/admin/campanas" 
                className={`navbar-link ${isActiveRoute('/admin/campanas') ? 'active' : ''}`}
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
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" 
                  />
                </svg>
                Campañas
              </Link>

              {/* Reportes */}
              <Link 
                to="/admin/reportes" 
                className={`navbar-link ${isActiveRoute('/admin/reportes') ? 'active' : ''}`}
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
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" 
                  />
                </svg>
                Reportes
              </Link>
            </>
          ) : (
            /* ========================================
               MENÚ PARA USUARIO NORMAL
            ======================================== */
            <>
              {/* Campañas */}
              <Link 
                to="/campanas" 
                className={`navbar-link ${isActiveRoute('/campanas') ? 'active' : ''}`}
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
                    d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" 
                  />
                </svg>
                Campañas
              </Link>

              {/* Resultados */}
              <Link 
                to="/dashboard" 
                className={`navbar-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
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
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" 
                  />
                </svg>
                Resultados
              </Link>
            </>
          )}

          {/* ========================================
              INFORMACIÓN DEL USUARIO
          ======================================== */}
          <div className="navbar-user">
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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" 
              />
            </svg>
            <span>{user?.nombre?.split(' ')[0] || 'Ingeniero'}</span>
            {esAdmin && (
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '0.125rem 0.375rem', 
                background: 'rgba(239, 68, 68, 0.2)', 
                color: '#EF4444',
                borderRadius: '3px',
                marginLeft: '0.25rem',
                fontWeight: '600'
              }}>
                ADMIN
              </span>
            )}
          </div>

          {/* ========================================
              BOTÓN DE LOGOUT
          ======================================== */}
          <button 
            onClick={onLogout} 
            className="btn-logout"
            title="Cerrar sesión"
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
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" 
              />
            </svg>
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar