import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, icon: Icon, iconColor = "text-blue-500", bgHeader = "bg-gray-50", maxWidth = "max-w-md" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} overflow-hidden animate-in zoom-in-95`}>
            {/* ส่วนหัวของป๊อปอัพ */}
            <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${bgHeader}`}>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {Icon && <Icon size={18} className={iconColor}/>} 
                    {title}
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition"><X size={20}/></button>
            </div>
            
            {/* เนื้อหาข้างในป๊อปอัพ (รับค่ามาจาก component อื่น) */}
            {children}
        </div>
    </div>
  );
}