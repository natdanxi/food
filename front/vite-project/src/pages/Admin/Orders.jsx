import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  ChefHat, CheckCircle, Clock, Utensils, 
  User, Store, ShoppingBag, Plus, Minus, Search, 
  Receipt, XCircle, Power, ChevronRight, Trash2, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../api';

import Modal from '../../components/ui/Modal';

const REJECT_REASONS = ['วัตถุดิบหมด', 'ร้านกำลังจะปิด', 'ออเดอร์เยอะทำไม่ทัน', 'ลูกค้าติดต่อขอยกเลิก'];
// 🟢 เพิ่มข้อมูล Add-ons
const ADDONS_LIST = [
  { name: 'ไข่ดาว', price: 5 }, { name: 'ไข่เจียว', price: 5 },
  { name: 'พิเศษ', price: 5 }, { name: 'เพิ่มข้าว', price: 5 }
];

const OrdersHeader = ({ appMode, setAppMode, pendingCount, currentTime, isOpen, toggleShopOpen, isTogglingOpen }) => (
  <div className="bg-white px-6 py-3 flex justify-between items-center shadow-sm z-20 shrink-0 border-b border-gray-200">
    <div className="flex bg-gray-100 p-1 rounded-xl">
        <button onClick={() => setAppMode('pos')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${appMode === 'pos' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Store size={18} /> หน้าร้าน (POS)
        </button>
        <button onClick={() => setAppMode('orders')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all relative ${appMode === 'orders' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Receipt size={18} /> คิวออเดอร์
            {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
        </button>
    </div>
    <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-500"><Clock size={16}/> {currentTime.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}</div>
        <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
        <button onClick={toggleShopOpen} disabled={isTogglingOpen} className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold transition-all active:scale-95 ${isOpen ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'} ${isTogglingOpen ? 'opacity-50' : ''}`}>
            <Power size={16} /> {isOpen ? 'เปิดรับออเดอร์' : 'ปิดร้าน'}
        </button>
    </div>
  </div>
);

const POSProductGrid = ({ products, searchTerm, setSearchTerm, openProductModal }) => (
  <div className="flex-1 flex flex-col bg-[#F4F6F8]">
    <div className="px-6 py-4 bg-white/50 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-lg font-black text-gray-800">เลือกเมนูอาหาร</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="ค้นหาเมนู..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-orange-500 shadow-sm" />
        </div>
    </div>
    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start pb-24">
      {products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) && p.isAvailable).map(item => (
        <button key={item.productId || item.id} onClick={() => openProductModal(item)} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:border-orange-300 transition-all group flex flex-col overflow-hidden text-left h-[220px]">
          <div className="w-full h-[130px] bg-gray-100 overflow-hidden relative shrink-0">
            {item.image ? <img src={`${API_URL}/uploads/${item.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center"><Utensils size={32} className="text-gray-300"/></div>}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg"><span className="text-sm font-black text-orange-600">฿{item.price}</span></div>
          </div>
          <div className="p-3 flex-1 flex flex-col justify-center"><p className="text-sm font-bold text-gray-800 line-clamp-2">{item.title}</p></div>
        </button>
      ))}
    </div>
  </div>
);

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

const QueueTabs = ({ activeTab, setActiveTab, pendingCount, cookingCount, completedCount, cancelledCount }) => (
  <div className="bg-white border-b border-gray-200 px-8 pt-5 flex gap-8 shrink-0 shadow-sm z-10 overflow-x-auto">
    {[
      { id: 'pending', label: 'รอรับออเดอร์', color: 'orange', count: pendingCount },
      { id: 'cooking', label: 'กำลังเตรียม', color: 'blue', count: cookingCount },
      { id: 'completed', label: 'เสร็จสิ้น', color: 'green', count: completedCount },
      { id: 'cancelled', label: 'ยกเลิกแล้ว', color: 'red', count: cancelledCount }
    ].map(tab => (
      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 px-2 text-[15px] font-black border-b-[3px] transition-colors flex items-center gap-2 ${activeTab === tab.id ? `border-${tab.color}-500 text-${tab.color}-600` : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
        {tab.label}
        <span className={`px-2.5 py-0.5 rounded-lg text-xs ${activeTab === tab.id ? `bg-${tab.color}-100` : 'bg-gray-100'}`}>{tab.count}</span>
      </button>
    ))}
  </div>
);

const OrderCard = ({ order, setViewSlipImage, openRejectModal, handleStatusChange }) => {
  const isWalkin = !order.user || order.orderType === 'walkin';
  return (
    <div className={`bg-white rounded-lg shadow-sm flex flex-col relative overflow-hidden transition-all border-t-4 ${order.status === 'pending' ? 'border-t-orange-400' : 'border-t-gray-200'}`}>
        <div className="px-4 py-3 border-b bg-gray-50/50 flex justify-between">
           <div>
               <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 rounded uppercase">{isWalkin ? 'หน้าร้าน' : 'ออนไลน์'}</span>
               <h3 className="text-xl font-black mt-1">#{order.ordersId || order.id}</h3>
           </div>
           <div className="text-right">
               <span className="text-xs font-bold text-gray-500"><Clock size={12} className="inline"/> {new Date(order.createdAt || order.orderDate).toLocaleTimeString('th-TH')}</span>
               <p className="text-xs font-bold text-gray-600 mt-1">{isWalkin ? (order.customerInfo || 'ลูกค้าทั่วไป') : `${order.user?.firstname || 'ไม่ระบุชื่อ'}`}</p>
           </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
            {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                    <span className="font-black bg-gray-100 px-2 py-0.5 rounded text-sm shrink-0">{item.quantity}x</span>
                    <div>
                        <p className="text-sm font-bold">{item.product?.title || item.name}</p>
                        {item.note && <p className="text-xs text-orange-600">- {item.note}</p>}
                    </div>
                </div>
            ))}
        </div>
        <div className="p-3 bg-white border-t space-y-2">
            <div className="flex justify-between font-bold text-sm mb-2"><span>ยอดสุทธิ</span><span className="text-orange-600">฿{order.totalAmount || order.totalPrice}</span></div>
            {order.paymentMethod === 'transfer' && (
                <button onClick={() => setViewSlipImage(`${API_URL}/uploads/${order.slipImage}`)} className="w-full text-xs bg-blue-100 text-blue-700 py-1.5 rounded font-bold hover:bg-blue-200">ดูสลิปโอนเงิน</button>
            )}
            {order.status === 'pending' && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => openRejectModal(order.ordersId || order.id)} className="flex-1 py-2 border border-red-200 text-red-600 rounded text-sm font-bold">ปฏิเสธ</button>
                <button onClick={() => handleStatusChange(order.ordersId || order.id, 'cooking')} className="flex-[2] py-2 bg-orange-500 text-white rounded text-sm font-bold">รับออเดอร์</button>
              </div>
            )}
            {order.status === 'cooking' && (
              <button onClick={() => handleStatusChange(order.ordersId || order.id, 'completed')} className="w-full py-2 bg-blue-600 text-white rounded text-sm font-bold">ทำเสร็จแล้ว</button>
            )}
        </div>
    </div>
  );
};

export default function AdminOrders() {
  const [appMode, setAppMode] = useState('pos'); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); 
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewSlipImage, setViewSlipImage] = useState(null);

  const [isOpen, setIsOpen] = useState(true);
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);

  const [products, setProducts] = useState([]); 
  const [cart, setCart] = useState([]);
  const [tableInfo, setTableInfo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  // 🟢 เพิ่ม State สำหรับรับค่า Addons เหมือนของลูกค้า
  const [tempNote, setTempNote] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());
  
  const prevPendingCount = useRef(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders(); fetchProducts(); fetchShopStatus();
    const interval = setInterval(fetchOrders, 5000); 
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  const fetchOrders = async () => {
    try { 
      const res = await axios.get(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }); 
      setOrders(res.data); 
      
      const currentPendingCount = res.data.filter(o => o.status === 'pending').length;
      if (currentPendingCount > prevPendingCount.current && prevPendingCount.current !== 0) {
          Swal.fire({
            toast: true, position: 'top-end', icon: 'info',
            title: 'มีออเดอร์ใหม่เข้ามา!', showConfirmButton: false, timer: 3000
          });
      }
      prevPendingCount.current = currentPendingCount;

    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchShopStatus = async () => {
    try { const res = await axios.get(`${API_URL}/api/shop/status`); setIsOpen(res.data.isOpenNow); } catch (err) {}
  };

  const toggleShopOpen = async () => {
    setIsTogglingOpen(true);
    try {
      const res = await axios.get(`${API_URL}/api/shop`);
      await axios.put(`${API_URL}/api/shop`, { isOpen: !isOpen, name: res.data.shopName }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      setIsOpen(!isOpen);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: !isOpen ? 'ร้านเปิดรับออเดอร์แล้ว' : 'ปิดร้านชั่วคราวแล้ว', showConfirmButton: false, timer: 2000 });
    } catch (err) { Swal.fire('เกิดข้อผิดพลาด', 'อัปเดตสถานะร้านไม่ได้', 'error'); } 
    finally { setIsTogglingOpen(false); }
  };

  const fetchProducts = async () => {
      try { const res = await axios.get(`${API_URL}/api/product`); setProducts(res.data); } catch (err) {}
  };

  const handleStatusChange = async (orderId, nextStatus) => {
    try { 
        await axios.put(`${API_URL}/api/order-status`, { id: orderId, status: nextStatus }, { headers: { Authorization: `Bearer ${token}` } }); 
        fetchOrders(); 
    } catch (err) { Swal.fire('เกิดข้อผิดพลาด', 'อัปเดตสถานะไม่ได้', 'error'); }
  };

  const confirmRejectOrder = async () => {
    if(!rejectReason) return alert("กรุณาเลือกเหตุผล");
    try {
      await axios.put(`${API_URL}/api/order-status`, { id: orderToReject, status: 'cancelled', rejectReason }, { headers: { Authorization: `Bearer ${token}` } });
      setRejectModalOpen(false); fetchOrders();
    } catch (err) { Swal.fire('เกิดข้อผิดพลาด', 'ยกเลิกคิวไม่ได้', 'error'); }
  };

  // 🟢 รีเซ็ตค่า Addons เมื่อเปิดหน้าต่างเมนูใหม่
  const openProductModal = (product) => { 
    setSelectedProduct(product); 
    setTempQty(1); 
    setTempNote('');
    setSelectedAddons([]);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    
    // 🟢 รวมราคาและสร้าง Note
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

  const updateQty = (cartId, delta) => { setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0)); };
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.qty), 0), [cart]);

  const handleWalkinCheckout = async (paymentMethod) => {
    if (cart.length === 0) return;
    try {
      await axios.post(`${API_URL}/api/order-walkin`, { cart, cartTotal, orderType: 'walkin', paymentMethod, customerInfo: tableInfo || 'ลูกค้าหน้าร้าน' }, { headers: { Authorization: `Bearer ${token}` } });
      setCart([]); setTableInfo(''); fetchOrders(); 
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกยอดขายเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) { Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error'); }
  };

  const filteredOrders = orders.filter(o => o.status === activeTab);

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] bg-[#F1F3F5] -m-4 sm:-m-6">
      <OrdersHeader appMode={appMode} setAppMode={setAppMode} pendingCount={orders.filter(o => o.status === 'pending').length} currentTime={currentTime} isOpen={isOpen} toggleShopOpen={toggleShopOpen} isTogglingOpen={isTogglingOpen} />

      <div className="flex-1 flex overflow-hidden w-full">
        {appMode === 'pos' && (
          <div className="flex-1 flex w-full animate-in fade-in duration-300">
            <POSProductGrid products={products} searchTerm={searchTerm} setSearchTerm={setSearchTerm} openProductModal={openProductModal} />
            <POSCartSidebar cart={cart} tableInfo={tableInfo} setTableInfo={setTableInfo} updateQty={updateQty} cartTotal={cartTotal} handleWalkinCheckout={handleWalkinCheckout} />
          </div>
        )}

        {appMode === 'orders' && (
           <div className="flex-1 flex flex-col w-full">
             <QueueTabs activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={orders.filter(o=>o.status==='pending').length} cookingCount={orders.filter(o=>o.status==='cooking').length} completedCount={orders.filter(o=>o.status==='completed').length} cancelledCount={orders.filter(o=>o.status==='cancelled').length} />
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
                {filteredOrders.map(order => <OrderCard key={order.ordersId || order.id} order={order} setViewSlipImage={setViewSlipImage} openRejectModal={(id) => { setOrderToReject(id); setRejectModalOpen(true); }} handleStatusChange={handleStatusChange} />)}
             </div>
           </div>
        )}
      </div>

      {/* 🟢 อัปเดต Modal เลือก Add-ons ให้หน้าตาเหมือนฝั่งลูกค้า */}
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
         <img src={viewSlipImage} className="w-full" />
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="ปฏิเสธออเดอร์">
         <div className="space-y-4">
            {REJECT_REASONS.map(r => <button key={r} onClick={() => setRejectReason(r)} className={`block w-full text-left p-2 border rounded ${rejectReason === r ? 'bg-red-100 border-red-500' : ''}`}>{r}</button>)}
            <button onClick={confirmRejectOrder} className="w-full bg-red-500 text-white py-2 rounded font-bold mt-4">ยืนยันปฏิเสธ</button>
         </div>
      </Modal>
    </div>
  );
}