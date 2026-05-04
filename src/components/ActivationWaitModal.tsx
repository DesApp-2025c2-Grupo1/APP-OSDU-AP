import { Clock, CheckCircle, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivationWaitModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white max-w-sm w-full rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-unahur/10 rounded-3xl flex items-center justify-center mb-6">
            <Clock className="text-unahur animate-pulse" size={40} />
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            ¡Solicitud Recibida!
          </h3>
          
          <p className="text-gray-500 leading-relaxed mb-8">
            Tus datos han sido enviados correctamente. Un administrador revisará tu solicitud para <span className="font-bold text-gray-800">activar tu cuenta</span>. 
            Te notificaremos por correo una vez aprobada.
          </p>

          <button
            onClick={onClose}
            className="w-full py-4 bg-unahur text-white rounded-2xl font-bold shadow-lg shadow-unahur/20 hover:bg-unahur-dark transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Entendido
          </button>
        </div>

        <div className="bg-gray-50 py-4 px-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Universidad Nacional de Hurlingham
          </p>
        </div>
      </div>
    </div>
  );
}
