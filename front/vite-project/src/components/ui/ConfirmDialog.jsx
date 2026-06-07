import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, type = 'warning', title, message, 
  onConfirm, onCancel, confirmText = 'ตกลง', cancelText = 'ยกเลิก' 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-[320px] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95">
        
        {/* ไอคอนตามสถานะ */}
        {type === 'loading' && <Loader2 className="text-orange-500 animate-spin mb-4" size={48} />}
        {type === 'success' && <CheckCircle2 className="text-green-500 mb-4" size={56} />}
        {type === 'error' && <XCircle className="text-red-500 mb-4" size={56} />}
        {type === 'warning' && <AlertTriangle className="text-red-500 mb-4" size={48} />}
        
        <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm font-medium mb-6">{message}</p>
        
        {/* ปุ่มกดตามสถานะ */}
        {type === 'warning' ? (
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-3 bg-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-300 transition">{cancelText}</button>
            <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition">{confirmText}</button>
          </div>
        ) : type !== 'loading' ? (
          <button onClick={onConfirm} className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition">ตกลง</button>
        ) : null}
      </div>
    </div>
  );
}