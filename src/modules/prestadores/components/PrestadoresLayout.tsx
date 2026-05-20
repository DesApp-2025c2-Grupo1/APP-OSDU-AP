import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function PrestadoresLayout() {
  return (
    <div className="flex flex-col md:flex-row w-screen min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
