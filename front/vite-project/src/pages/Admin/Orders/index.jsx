import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Receipt, X, Minus, Plus } from 'lucide-react';
import { API_URL } from '../../../api';

// 🧠 นำเข้าสมอง (Logic) และค่าคงที่
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import { REJECT_REASONS, ADDONS_LIST } from '../../../constants';

// 🧩 นำเข้าอวัยวะ UI ที่หั่นแบ่งชิ้นไว้
import OrdersHeader from './OrdersHeader';
import POSProductGrid from './POSProductGrid';
import POSCartSidebar from './POSCartSidebar';
import QueueTabs from './QueueTabs';
import OrderCard from './OrderCard';
import Modal from '../../../components/ui/Modal';

export default function AdminOrders() {
  // ดึงข้อมูลและฟังก์ชันทั้งหมดมาจาก Hook
  const {
    appMode, setAppMode, orders, loading, activeTab, setActiveTab, isOpen, isTogglingOpen,
    products, categories, activeCategory, setActiveCategory, cart, setCart, tableInfo, setTableInfo,
    searchTerm, setSearchTerm, currentTime, updateQty, cartTotal, toggleShopOpen, handleStatusChange, 
    handleWalkinCheckout, fetchOrders
  } = useAdminOrders();

  // --- States สำหรับคุม Popup/Modal ในหน้านี้ ---
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewSlipImage, setViewSlipImage] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempNote, setTempNote] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);

  // --- ฟังก์ชันจัดการ Modal เลือกเมนู ---
  const openProductModal = (product) => { 
    setSelectedProduct(product); 
    setTempQty(1); 
    setTempNote('');
    setSelectedAddons([]);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    
    const addonsPrice = selectedAddons.length * 5;
    const addonsText = selectedAddons.length > 0 ? `เพิ่ม: ${selectedAddons.join(', ')}` : '';
    const finalNote = [addonsText, tempNote].filter(Boolean).join(' | ');
    const finalPrice = parseFloat(selectedProduct.price) + addonsPrice;

    setCart(prev => [...prev, { 
      ...selectedProduct, 
      cartId: Date.now().toString(), 
      qty: tempQty, 
      price: finalPrice, 
      image: selectedProduct.image, 
      note: finalNote 
    }]);
    setSelectedProduct(null); 
  };

  const confirmRejectOrder = async () => {
    if(!rejectReason) return alert("กรุณาเลือกเหตุผล");
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/order-status`, { id: orderToReject, status: 'cancelled', rejectReason }, { headers: { Authorization: `Bearer ${token}` } });
      setRejectModalOpen(false); 
      fetchOrders();
    } catch (err) { Swal.fire('เกิดข้อผิดพลาด', 'ยกเลิกคิวไม่ได้', 'error'); }
  };

  const filteredOrders = orders.filter(o => o.status === activeTab);

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] bg-[#F1F3F5] -m-4 sm:-m-6">
      
      <OrdersHeader 
        appMode={appMode} setAppMode={setAppMode} 
        pendingCount={orders.filter(o => o.status === 'pending').length} 
        currentTime={currentTime} isOpen={isOpen} 
        toggleShopOpen={toggleShopOpen} isTogglingOpen={isTogglingOpen} 
      />

      <div className="flex-1 flex overflow-hidden w-full">
        {/* โหมด POS หน้าร้าน */}
        {appMode === 'pos' && (
          <div className="flex-1 flex w-full animate-in fade-in duration-300">
            <POSProductGrid 
              products={products} categories={categories} activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory} searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
              openProductModal={openProductModal} 
            />
            <POSCartSidebar cart={cart} tableInfo={tableInfo} setTableInfo={setTableInfo} updateQty={updateQty} cartTotal={cartTotal} handleWalkinCheckout={handleWalkinCheckout} />
          </div>
        )}

        {/* โหมด จัดการคิวออเดอร์ */}
        {appMode === 'orders' && (
           <div className="flex-1 flex flex-col w-full">
             <QueueTabs 
               activeTab={activeTab} setActiveTab={setActiveTab} 
               pendingCount={orders.filter(o=>o.status==='pending').length} 
               cookingCount={orders.filter(o=>o.status==='cooking').length} 
               completedCount={orders.filter(o=>o.status==='completed').length} 
               cancelledCount={orders.filter(o=>o.status==='cancelled').length} 
             />
             
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <OrderCard 
                      key={order.ordersId || order.id} order={order} setViewSlipImage={setViewSlipImage} 
                      openRejectModal={(id) => { setOrderToReject(id); setRejectModalOpen(true); }} 
                      handleStatusChange={handleStatusChange} 
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                    <Receipt size={64} className="mb-4 opacity-30" />
                    <p className="text-lg font-bold">ไม่มีรายการออเดอร์ในสถานะนี้</p>
                  </div>
                )}
             </div>
           </div>
        )}
      </div>

      {/* --- Modals ต่างๆ --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[420px] rounded-[24px] p-6 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-black text-gray-900 line-clamp-1">{selectedProduct.title}</h2>
              <button onClick={() => setSelectedProduct(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors shrink-0"><X size={18}/></button>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">เพิ่มตัวเลือกพิเศษ</p>
              <div className="grid grid-cols-2 gap-3">
                {ADDONS_LIST.map((addon, i) => (
                  <button key={i} onClick={() => setSelectedAddons(prev => prev.includes(addon.name) ? prev.filter(a => a !== addon.name) : [...prev, addon.name])} className={`flex justify-between border rounded-xl px-3 py-2.5 transition-all active:scale-95 ${selectedAddons.includes(addon.name) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'}`}>
                    <span className="text-[13px] font-bold">{addon.name}</span><span className="text-[12px]">+฿{addon.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-3">หมายเหตุ</p>
              <input type="text" value={tempNote} onChange={e => setTempNote(e.target.value)} placeholder="เช่น ไม่เผ็ด, ไข่ดาวสุกๆ..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-2 py-2 w-[110px] shrink-0">
                <button onClick={() => setTempQty(Math.max(1, tempQty - 1))} className="text-gray-400 hover:text-gray-800 p-1"><Minus size={18}/></button>
                <span className="font-bold text-gray-800 text-[16px]">{tempQty}</span>
                <button onClick={() => setTempQty(tempQty + 1)} className="text-gray-400 hover:text-gray-800 p-1"><Plus size={18}/></button>
              </div>
              <button onClick={confirmAddToCart} className="flex-1 bg-[#ea580c] hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl flex justify-between px-5 transition-all shadow-sm active:scale-95">
                <span>เพิ่มลงตะกร้า</span><span className="font-black text-[16px]">฿{(parseFloat(selectedProduct.price) + (selectedAddons.length * 5)) * tempQty}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={!!viewSlipImage} onClose={() => setViewSlipImage(null)} title="สลิปโอนเงิน">
         <img src={viewSlipImage} className="w-full rounded-xl" alt="Slip" />
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="ปฏิเสธออเดอร์">
         <div className="space-y-4">
            {REJECT_REASONS.map(r => <button key={r} onClick={() => setRejectReason(r)} className={`block w-full text-left p-3 border-2 rounded-xl font-bold transition-all ${rejectReason === r ? 'bg-red-50 border-red-500 text-red-600' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}>{r}</button>)}
            <button onClick={confirmRejectOrder} className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-black mt-4 shadow-md transition-all active:scale-95">ยืนยันปฏิเสธ</button>
         </div>
      </Modal>
    </div>
  );
}