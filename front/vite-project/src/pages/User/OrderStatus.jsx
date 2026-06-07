import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChefHat, Clock, CheckCircle, Utensils, Loader2, ArrowRight, Receipt, XCircle, X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../api';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CANCEL_REASONS = ['สั่งผิดเมนู/สั่งซ้ำ', 'ต้องการเปลี่ยนรายการ', 'ลืมระบุหมายเหตุ', 'เปลี่ยนใจ'];

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // 🟢 ใช้ useRef เพื่อเก็บสถานะเก่า ไว้เปรียบเทียบหาการเปลี่ยนแปลง
  const prevStatusRef = useRef({});

  const fetchStatus = useCallback(async () => {
    try {
      // ⚠️ ถ้าครั้งแรกยังโหลดอยู่ ให้คงสถานะ loading ไว้
      const res = await axios.get(`${API_URL}/api/user/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const today = new Date().toDateString();
      const activeOrders = res.data.filter(o => {
          if (o.status?.toLowerCase() === 'completed') return false;
          if (o.status?.toLowerCase() === 'cancelled') return new Date(o.createdAt).toDateString() === today; 
          return true;
      });
      
      const sortedOrders = activeOrders.sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);

      // 🟢 ตรวจสอบสถานะว่าเปลี่ยนไปหรือไม่ เพื่อแสดงแจ้งเตือน
      sortedOrders.forEach(order => {
        const prevStatus = prevStatusRef.current[order.id];
        if (prevStatus && prevStatus !== order.status) {
            if (order.status === 'cooking') {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'แม่ครัวรับออเดอร์แล้ว! กำลังเตรียมอาหารค่ะ', showConfirmButton: false, timer: 4000 });
            } else if (order.status === 'completed') {
                Swal.fire({ title: 'อาหารเสร็จแล้ว!', text: `ออเดอร์ #${order.id} พร้อมเสิร์ฟค่ะ`, icon: 'success', confirmButtonText: 'รับทราบ', confirmButtonColor: '#ea580c' });
            }
        }
        prevStatusRef.current[order.id] = order.status;
      });

    } catch (err) { 
        console.error("Fetch Status Error:", err); 
    } finally { 
        setLoading(false); 
    }
  }, [token]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); 
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    if (cancelModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [cancelModalOpen]);

  const openCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    try {
      await axios.put(`${API_URL}/api/user/cancel-order`, {
        id: orderToCancel,
        rejectReason: `[ลูกค้ายกเลิกเอง] ${cancelReason || 'ไม่ระบุเหตุผล'}` 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStatus(); 
      setCancelModalOpen(false);
      setOrderToCancel(null);
      Swal.fire({ title: 'สำเร็จ', text: 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถยกเลิกคำสั่งซื้อได้', 'error');
    }
  };

  const OrderProgress = ({ status }) => {
    const steps = [
      { id: 'pending', icon: <Clock size={18}/>, label: 'รับออเดอร์' },
      { id: 'cooking', icon: <ChefHat size={18}/>, label: 'กำลังทำ' },
      { id: 'completed', icon: <CheckCircle size={18}/>, label: 'เสร็จสิ้น' }
    ];
    let progressWidth = '0%';
    let activeStepIndex = 0;
    if (status === 'cooking') { progressWidth = '50%'; activeStepIndex = 1; }
    if (status === 'completed') { progressWidth = '100%'; activeStepIndex = 2; }

    return (
      <div className="w-full mt-2 mb-6 px-2">
        <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-out" style={{ width: progressWidth }}></div>
            <div className="flex justify-between relative z-10">
                {steps.map((step, index) => {
                    const isActive = index <= activeStepIndex;
                    const isCurrent = index === activeStepIndex;
                    return (
                        <div key={index} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-md scale-110' : 'border-gray-200 bg-white text-gray-300'}`}>
                                {isCurrent && status === 'cooking' ? <div className="animate-bounce">{step.icon}</div> : step.icon}
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-orange-600' : 'text-gray-300'}`}>{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <Navbar />
      <div className="p-4 md:p-6 max-w-lg mx-auto pb-24 relative">
        <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                <span className="bg-orange-100 p-2 rounded-xl text-orange-600"><Clock size={24}/></span>
                สถานะคำสั่งซื้อ
            </h2>
        </div>

        {loading && orders.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="animate-spin text-orange-500" size={40}/><p className="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p></div>
        ) : orders.length === 0 ? (
            <div className="bg-white p-10 rounded-[32px] text-center shadow-sm border border-gray-100 flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm"><CheckCircle size={48} className="text-green-500"/></div>
                <h3 className="text-xl font-bold text-gray-800">ไม่มีคิวที่รออยู่</h3>
                <p className="text-gray-400 mt-2 mb-8 text-sm">อาหารได้รับครบแล้ว หรือคุณยังไม่ได้สั่งครับ</p>
                <button onClick={() => navigate('/menu')} className="w-full py-4 bg-gray-800 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex justify-center items-center gap-2 active:scale-95">สั่งอาหารเพิ่ม <ArrowRight size={20}/></button>
            </div>
         ) : (
            <div className="space-y-6">
                {orders.map((order, idx) => {
                    const cleanReason = order.rejectReason ? order.rejectReason.replace('[ลูกค้ายกเลิกเอง] ', '') : '';
                    
                    return (
                    <div key={order.id} className={`bg-white p-6 rounded-[32px] shadow-sm border relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500 ${order.status === 'cancelled' ? 'border-red-200' : 'border-gray-100'}`} style={{animationDelay: `${idx * 100}ms`}}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${order.status === 'cancelled' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>#{order.id}</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">เวลาสั่งซื้อ</p>
                                    <p className="text-lg font-bold text-gray-800">{new Date(order.createdAt).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.</p>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : order.status === 'cooking' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                {order.status === 'cancelled' ? 'ถูกยกเลิก' : order.status === 'cooking' ? 'กำลังปรุง' : 'รอรับออเดอร์'}
                            </div>
                        </div>

                        {order.status === 'cancelled' ? (
                          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                              <XCircle size={24} className="text-red-500 shrink-0"/>
                              <div>
                                  <h4 className="text-sm font-bold text-red-700">คำสั่งซื้อนี้ถูกยกเลิกแล้ว</h4>
                                  <p className="text-xs text-red-600 mt-1">เหตุผล: {cleanReason || 'ร้านไม่สามารถรับออเดอร์ได้ในขณะนี้'}</p>
                              </div>
                          </div>
                        ) : ( <OrderProgress status={order.status} /> )}

                        <div className={`rounded-2xl p-4 border ${order.status === 'cancelled' ? 'bg-gray-50/30 border-gray-100 opacity-60 grayscale' : 'bg-gray-50/50 border-gray-100'}`}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-3"><Utensils size={12}/> รายการอาหาร</p>
                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-start text-sm">
                                        <div className="flex gap-3">
                                            <span className={`text-white font-bold w-5 h-5 rounded flex items-center justify-center text-[10px] shadow-sm mt-0.5 ${order.status === 'cancelled' ? 'bg-gray-400' : 'bg-orange-500'}`}>{item.quantity}</span>
                                            <div>
                                              <span className="font-bold text-gray-700 leading-none">{item.product.title}</span>
                                              {item.note && <p className="text-[11px] text-gray-500 font-medium mt-0.5">↳ {item.note}</p>}
                                            </div>
                                        </div>
                                        <span className="text-gray-400 font-medium text-xs shrink-0">฿{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-5">
                            <div className="flex justify-between items-center px-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <Receipt size={14} className="text-gray-400"/>
                                    {order.paymentMethod === 'transfer' ? 'โอนจ่าย' : 'เงินสด'}
                                </div>
                                <div className="text-right flex items-baseline gap-2">
                                    <span className="text-xs text-gray-400 font-bold uppercase">รวมสุทธิ</span>
                                    <span className={`text-2xl font-black ${order.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-orange-500'}`}>฿{order.totalAmount}</span>
                                </div>
                            </div>

                            {order.status === 'pending' && (
                              <div className="mt-4 pt-4 border-t border-gray-100 border-dashed">
                                <button onClick={() => openCancelModal(order.id)} className="w-full py-3.5 bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 text-[15px]">
                                  <XCircle size={18} /> ยกเลิกคำสั่งซื้อนี้
                                </button>
                                <p className="text-center text-[11px] text-gray-400 mt-2 font-medium">*สามารถยกเลิกได้ก่อนที่ทางร้านจะกดยืนยันเริ่มทำอาหาร</p>
                              </div>
                            )}
                        </div>
                    </div>
                )})}
            </div>
         )}
      </div>

      {cancelModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[400px] rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-red-50/50 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-inner"><XCircle size={22}/></div>
                 <h2 className="text-[18px] font-black text-red-600">ยกเลิกคิว #{orderToCancel}</h2>
               </div>
               <button onClick={() => setCancelModalOpen(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-800 shadow-sm border border-gray-200"><X size={18}/></button>
            </div>
            <div className="p-6 bg-white">
               <h4 className="font-bold text-gray-800 mb-3 text-[14px]">เหตุผลการยกเลิก:</h4>
               <div className="flex flex-wrap gap-2 mb-4">
                 {CANCEL_REASONS.map(reason => (
                   <button key={reason} onClick={() => setCancelReason(reason)} className={`px-3 py-2 rounded-xl text-[12px] font-bold border transition-all active:scale-95 ${cancelReason === reason ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>{reason}</button>
                 ))}
               </div>
               <textarea rows="3" placeholder="พิมพ์ระบุเหตุผลอื่นๆ..." className="w-full bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[14px] font-medium focus:outline-none focus:border-red-400 focus:bg-white transition-colors resize-none" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}></textarea>
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setCancelModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-3.5 rounded-[16px] transition-all hover:bg-gray-100 text-[15px]">ปิด</button>
              <button onClick={confirmCancelOrder} className="flex-[1.5] bg-red-500 hover:bg-red-600 text-white font-black py-3.5 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(239,68,68,0.3)] active:scale-95 flex justify-center items-center gap-2 text-[15px]">ยืนยันการยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderStatus;