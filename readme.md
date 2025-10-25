# Proyecto Desarrollo Web - Sistema de Votación

## Estudiantes
- Francisco Alexander Chic Barrios - 9490-22-2513
- Herbert Daniel Jocol Morataya - 9490-22-423

## Descripción del Proyecto
El proyecto consiste en una plataforma web para la gestión y realización de votaciones destinadas a la elección de la Junta Directiva del Colegio de Ingenieros de Guatemala. La aplicación permite el registro de votantes (ingenieros colegiados), la gestión de campañas por parte de administradores, la emisión de votos por categorías y la visualización de resultados en tiempo real.  

El proyecto integra **Frontend en React con SASS/SCSS** y **Backend en Node.js con Express**, utilizando **PostgreSQL** como base de datos. Las peticiones al backend incluyen autenticación mediante **JWT** para garantizar la seguridad de las sesiones.

## Tecnologías y Herramientas Utilizadas
- **Frontend:** React, SASS/SCSS, React Router, Axios
- **Backend:** Node.js, Express, JWT, PostgreSQL
- **Base de Datos:** PostgreSQL
- **Control de Versiones:** Git, GitHub
- **Despliegue en la Nube:** 
  - Frontend: Netlify - [https://votos-guate.netlify.app/](https://votos-guate.netlify.app/)
  - Backend: Render - [https://votosguate-api.onrender.com](https://votosguate-api.onrender.com)

## Ramas del Proyecto
- **main:** Rama principal donde se consolida el desarrollo.
- **frontendproductivo:** Rama utilizada para subir la versión de producción del frontend a Netlify.
- **productivobackend:** Rama utilizada para subir la versión de producción del backend a Render.

## Estructura del Proyecto
ProyectoDesarrolloWEB/
├── Backend/
│ ├── api.js
│ ├── exampleBDD
│ ├── package.json
│ └── package-lock.json
├── Frontend/
│ ├── public/
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── scss/
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── package.json
│ └── vite.config.js
└── readme.md


## Requerimientos Técnicos
1. Registro de votantes con validación de datos.
2. Autenticación de usuarios mediante número de colegiado, DPI, fecha de nacimiento y contraseña.
3. Gestión de campañas de votación por administradores.
4. Visualización de candidatos y votación por categoría (máximo 7 votos por usuario, uno por rango).
5. Resultados en tiempo real por cargo y campaña.
6. Panel administrativo para creación, modificación y cierre de campañas, asignación de candidatos y generación de reportes.
7. Integración con JWT para asegurar la veracidad de la sesión en todas las peticiones.
8. Proyecto desplegado en la nube con frontend en Netlify y backend en Render.

## Base de Datos
- PostgreSQL con tablas principales: administradores, campañas, candidatos, cargos_directiva, ingenieros_colegiados, departamentos, municipios, votos y votos_por_campaña.
- Conexión al servidor en Render:
- Hostname: dpg-d3u1u8muk2gs73dhi6qg-a
- Port: 5432
- Database: sistema_votacion_gt
- Username: sistema_votacion_gt_user
- Password: CxjVWPVM2p8jXq0MGs2YFPt7v1G1xURN
- URL: postgresql://sistema_votacion_gt_user:CxjVWPVM2p8jXq0MGs2YFPt7v1G1xURN@dpg-d3u1u8muk2gs73dhi6qg-a.oregon-postgres.render.com/sistema_votacion_gt


## Enlaces de Producción
- **Frontend:** [https://votos-guate.netlify.app/](https://votos-guate.netlify.app/)
- **Backend (API):** [https://votosguate-api.onrender.com](https://votosguate-api.onrender.com)

## Uso
- Los usuarios pueden registrarse, iniciar sesión y votar en las campañas activas.
- Los administradores pueden gestionar campañas, asignar candidatos, habilitar o cerrar votaciones, y consultar resultados en tiempo real.
