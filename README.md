# AppMediUnahur-AP — Portal de Prestadores

Frontend del portal de prestadores del Portal de Medicina Integral UNAHUR. Permite a los prestadores gestionar solicitudes, turnos, situaciones terapéuticas e historia clínica.

## Tecnologías

- React + TypeScript + Vite
- Tailwind CSS
- React Router DOM
- Autenticación via cookie JWT (httpOnly)

## Requisitos previos

- [Node.js v18+](https://nodejs.org/)
- Backend `app-unahur-portal` corriendo en el puerto 9002

## Instalación

```bash
# 1. Clonar el repo
git clone <url-del-repo>
cd AppMediUnahur-AP

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
```

## Variables de entorno

Crear un archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:9002
VITE_USER_MOCK=false
```

> `VITE_USER_MOCK=false` usa el backend real. Cambiar a `true` solo para desarrollo sin backend.

## Ejecutar en desarrollo

```bash
npm run dev
```

El portal queda disponible en **http://localhost:5173** (o 5174/5175 si el puerto ya está en uso)

## Acceso

Los prestadores inician sesión con sus credenciales registradas en el sistema (CUIT/CUIL + contraseña).

## Funcionalidades

- **Dashboard**: estadísticas y resumen del prestador
- **Solicitudes**: gestión de solicitudes de afiliados
- **Turnos**: agenda de turnos por mes
- **Situaciones terapéuticas**: registro y seguimiento por afiliado
- **Historia clínica**: consulta del historial de afiliados
