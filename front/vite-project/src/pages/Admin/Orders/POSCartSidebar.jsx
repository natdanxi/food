import React from 'react';
import { ShoppingBag, User, Trash2, ChevronRight, Minus, Plus } from 'lucide-react';

const POSCartSidebar = ({ cart, tableInfo, setTableInfo, updateQty, cartTotal, handleWalkinCheckout }) => (
  <div className="w-[380px] xl:w-[420px] bg-white flex flex-col shrink-0 shadow-[-4px_0_20px_rgba(0,0,0,0.03)] z-20 border-l border-gray-200">
    <div className="p-5 border-b border-gray-100 bg-white">
      <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <ShoppingBag size={20} className="text-orange-500"/> ตะกร้าสินค้า
        <span className="ml-auto bg-orange-100 text-orange-600 text-xs px-2.5 py-1 rounded-full">{cart.length} รายการ</span>
      </h3>
      <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input type="text" placeholder="ระบุชื่อลูกค้า หรือ โต๊ะ..." value={tableInfo} onChange={(e) => setTableInfo(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-orange-500" />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
      {cart.length > 0 ? cart.map((item) => (
          <div key={item.cartId} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-orange-200 transition-colors">
            <button onClick={() => updateQty(item.cartId, -item.qty)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
            <div className="pr-8">
              <span className="font-bold text-sm text-gray-800 line-clamp-2">{item.title}</span>
              {item.note && <div className="text-xs font-bold text-gray-500 mt-1 flex items-start gap-1"><ChevronRight size={14} className="text-orange-400 shrink-0"/> <span>{item.note}</span></div>}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
              <span className="font-black text-orange-600">฿{item.price * item.qty}</span>
              <div className="flex gap-3 bg-gray-50 rounded-xl p-1 border">
                <button onClick={() => updateQty(item.cartId, -1)} className="w-7 h-7 bg-white shadow-sm flex items-center justify-center hover:text-orange-500"><Minus size={16}/></button>
                <span className="w-4 text-center font-bold text-sm">{item.qty}</span>
                <button onClick={() => updateQty(item.cartId, 1)} className="w-7 h-7 bg-white shadow-sm flex items-center justify-center hover:text-orange-500"><Plus size={16}/></button>
              </div>
            </div>
          </div>
      )) : (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60"><ShoppingBag size={48} className="mb-3"/><p className="font-bold text-sm">ยังไม่มีรายการอาหาร</p></div>
      )}
    </div>
    <div className="p-5 bg-white border-t border-gray-100">
      <div className="flex justify-between items-end mb-4">
        <span className="font-bold text-gray-500 text-sm">ยอดชำระสุทธิ</span>
        <span className="text-3xl font-black text-gray-900">฿{cartTotal.toLocaleString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleWalkinCheckout('cash')} disabled={cart.length===0} className="bg-[#1A1D23] hover:bg-black disabled:bg-gray-200 text-white py-3.5 rounded-xl font-bold text-sm">ชำระเงินสด</button>
        <button onClick={() => handleWalkinCheckout('transfer')} disabled={cart.length===0} className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white py-3.5 rounded-xl font-bold text-sm">โอน/สแกน QR</button>
      </div>
    </div>
  </div>
);

export default POSCartSidebar;