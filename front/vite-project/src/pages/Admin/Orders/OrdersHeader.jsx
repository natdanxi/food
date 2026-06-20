import React from 'react';
import { Store, Receipt, Clock, Power } from 'lucide-react';

const OrdersHeader = ({ appMode, setAppMode, pendingCount, currentTime, isOpen, toggleShopOpen, isTogglingOpen }) => (
  <div className="bg-white px-6 py-3 flex justify-between items-center shadow-sm z-20 shrink-0 border-b border-gray-200">
    <div className="flex bg-gray-100 p-1 rounded-xl">
      <button 
        onClick={() => setAppMode('pos')} 
        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${appMode === 'pos' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <Store size={18} /> หน้าร้าน (POS)
      </button>
      <button 
        onClick={() => setAppMode('orders')} 
        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all relative ${appMode === 'orders' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <Receipt size={18} /> คิวออเดอร์
        {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
      </button>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-500">
        <Clock size={16}/> {currentTime.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
      </div>
      <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
      <button 
        onClick={toggleShopOpen} 
        disabled={isTogglingOpen} 
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold transition-all active:scale-95 ${isOpen ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'} ${isTogglingOpen ? 'opacity-50' : ''}`}
      >
        <Power size={16} /> {isOpen ? 'เปิดรับออเดอร์' : 'ปิดร้าน'}
      </button>
    </div>
  </div>
);

export default OrdersHeader;
