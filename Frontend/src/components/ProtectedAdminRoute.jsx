// Frontend/src/components/ProtectedAdminRoute.jsx
import { Navigate } from 'react-router-dom'

function ProtectedAdminRoute({ children, user }) {
  // Si no hay usuario, redirigir al login
  if (!user) {
    console.log('❌ No hay usuario, redirigiendo a login...')
    return <Navigate to="/login" replace />
  }

  // Si el usuario no es admin, redirigir a campañas
  if (!user.es_admin && user.rol !== 'admin') {
    console.log('❌ Usuario sin permisos de admin, redirigiendo a campañas...')
    return <Navigate to="/campañas" replace />
  }

  // Si es admin, mostrar el contenido
  console.log('✅ Usuario admin verificado')
  return children
}

export default ProtectedAdminRoute