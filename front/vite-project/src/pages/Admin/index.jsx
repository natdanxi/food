import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  ChefHat, CheckCircle, Clock, Utensils, 
  User, Store, ShoppingBag, Plus, Minus, Search, 
  Receipt, XCircle, Power, ChevronRight, Trash2, X,
  Phone, QrCode, Banknote
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../api';

import OrdersHeader from './Orders/OrdersHeader';
import POSProductGrid from './Orders/POSProductGrid';
import POSCartSidebar from './Orders/POSCartSidebar';
import QueueTabs from './Orders/QueueTabs';
import OrderCard from './Orders/OrderCard';
import Modal from '../../components/ui/Modal';

const REJECT_REASONS = ['วัตถุดิบหมด', 'ร้านกำลังจะปิด', 'ออเดอร์เยอะทำไม่ทัน', 'ลูกค้าติดต่อขอยกเลิก'];

export default function AdminOrders() {
  const [appMode, setAppMode] = useState('pos'); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); 
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewSlipImage, setViewSlipImage] = useState(null);

  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('shopIsOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);

  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all'); 
  const [cart, setCart] = useState([]);
  const [tableInfo, setTableInfo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempNote, setTempNote] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());
  
  const isFirstLoad = useRef(true);
  const prevPendingCount = useRef(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders(); fetchProducts(); fetchCategories(); fetchShopStatus(); 
    const interval = setInterval(fetchOrders, 5000); 
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  const fetchOrders = async () => {
    try { 
      const res = await axios.get(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }); 
      setOrders(res.data); 
      
      const currentPendingCount = res.data.filter(o => o.status === 'pending').length;
      
      if (!isFirstLoad.current && currentPendingCount > prevPendingCount.current) {
          const audio = new Audio('https://actions.google.com/sounds/v1/alarms/store_door_chime.ogg');
          audio.play().catch(e => console.log('Audio error:', e));

          Swal.fire({
            toast: true, position: 'top-end', icon: 'info',
            title: '🔔 มีออเดอร์ใหม่เข้ามา!', showConfirmButton: false, timer: 4000
          });
      }
      prevPendingCount.current = currentPendingCount;
      isFirstLoad.current = false;

    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchShopStatus = async () => {
    try { 
      const res = await axios.get(`${API_URL}/api/shop`); 
      setIsOpen(res.data.isOpen !== false); 
      localStorage.setItem('shopIsOpen', JSON.stringify(res.data.isOpen !== false));
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try { const res = await axios.get(`${API_URL}/api/category`); setCategories(res.data); } catch (err) {}
  };

  // 🟢 แก้ไขจุดนี้: แปลงข้อมูลเป็น FormData เพื่อให้หลังบ้านยอมรับการเซฟลงฐานข้อมูล
  const toggleShopOpen = async () => {
    setIsTogglingOpen(true);
    try {
      const nextStatus = !isOpen;
      
      const formData = new FormData();
      formData.append('isOpen', nextStatus);

      await axios.put(`${API_URL}/api/shop`, formData, { 
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        } 
      });
      
      setIsOpen(nextStatus);
      localStorage.setItem('shopIsOpen', JSON.stringify(nextStatus));
      
      Swal.fire({ 
        toast: true, position: 'top-end', icon: 'success', 
        title: nextStatus ? 'ร้านเปิดรับออเดอร์แล้ว 🎉' : 'ปิดร้านชั่วคราวแล้ว 🔒', 
        showConfirmButton: false, timer: 2000 
      });
    } catch (err) { 
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะร้านผ่านเซิร์ฟเวอร์ได้', 'error'); 
    } finally { 
      setIsTogglingOpen(false); 
    }
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
    // 🟢 แก้ไขบรรทัดนี้: ลบ fixed ออก ใช้กรอบโค้งมนสวยงามให้อยู่ภายในโครงสร้าง Admin ไม่ทับ Navbar ด้านบน
    <div className="flex flex-col bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-100px)] relative z-10">
      <OrdersHeader appMode={appMode} setAppMode={setAppMode} pendingCount={orders.filter(o => o.status === 'pending').length} currentTime={currentTime} isOpen={isOpen} toggleShopOpen={toggleShopOpen} isTogglingOpen={isTogglingOpen} />

      <div className="flex-1 flex overflow-hidden w-full bg-[#F1F3F5]">
        {appMode === 'pos' && (
          <div className="flex-1 flex w-full animate-in fade-in duration-300">
            <POSProductGrid products={products} categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} searchTerm={searchTerm} setSearchTerm={setSearchTerm} openProductModal={openProductModal} />
            <POSCartSidebar cart={cart} tableInfo={tableInfo} setTableInfo={setTableInfo} updateQty={updateQty} cartTotal={cartTotal} handleWalkinCheckout={handleWalkinCheckout} />
          </div>
        )}

        {appMode === 'orders' && (
           <div className="flex-1 flex flex-col w-full">
             <QueueTabs activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={orders.filter(o=>o.status==='pending').length} cookingCount={orders.filter(o=>o.status==='cooking').length} completedCount={orders.filter(o=>o.status==='completed').length} cancelledCount={orders.filter(o=>o.status==='cancelled').length} />
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => <OrderCard key={order.ordersId || order.id} order={order} setViewSlipImage={setViewSlipImage} openRejectModal={(id) => { setOrderToReject(id); setRejectModalOpen(true); }} handleStatusChange={handleStatusChange} />)
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

      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[420px] rounded-[24px] p-6 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-black text-gray-900 line-clamp-1">{selectedProduct.title}</h2>
              <button onClick={() => setSelectedProduct(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors shrink-0"><X size={18}/></button>
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
         <img src={viewSlipImage} className="w-full rounded-xl" />
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