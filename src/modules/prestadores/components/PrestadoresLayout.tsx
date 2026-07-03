import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { api } from '../../../services/api'
import Sidebar from './Sidebar'

export default function PrestadoresLayout() {
  const { usuario, updateUsuario } = useAuth()

  useEffect(() => {
    if (usuario?.tipo !== 'prestador') return undefined

    let mounted = true

    api.getPrestadorProfile()
      .then(profile => {
        if (!mounted) return

        const nombreCompleto = profile.nombreCompleto?.trim()
        if (!nombreCompleto) return

        const nextPrestador = {
          nombre: nombreCompleto,
          apellido: '',
          cuit: profile.cuitCuil || usuario.cuit,
          email: profile.cuenta?.email || profile.emailPrincipal || usuario.email,
          debeCambiarPassword: profile.cuenta?.debeCambiarPassword ?? usuario.debeCambiarPassword,
        }

        const samePrestador =
          usuario.nombre === nextPrestador.nombre &&
          usuario.apellido === nextPrestador.apellido &&
          usuario.cuit === nextPrestador.cuit &&
          usuario.email === nextPrestador.email &&
          usuario.debeCambiarPassword === nextPrestador.debeCambiarPassword

        if (!samePrestador) updateUsuario(nextPrestador)
      })
      .catch(() => {
        // El portal puede seguir usando los datos de sesion si el perfil no carga.
      })

    return () => {
      mounted = false
    }
  }, [usuario, updateUsuario])

  return (
    <div className="flex flex-col md:flex-row w-screen min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
