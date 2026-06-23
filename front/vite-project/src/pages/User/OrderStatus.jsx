import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChefHat, Clock, CheckCircle, Utensils, Loader2, ArrowRight, Receipt, XCircle, X, ReceiptText } from 'lucide-react';
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
  
  const [receiptOrder, setReceiptOrder] = useState(null);
  const prevStatusRef = useRef({});

  const showNotification = (title, message) => {
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
    audio.play().catch(() => {});

    Swal.fire({
      toast: true, position: 'bottom-start', showConfirmButton: false, timer: 5000, timerProgressBar: true, background: '#ffffff',
      html: `
        <div style="display: flex; align-items: center; gap: 14px; padding: 4px;">
          <div style="width: 48px; height: 48px; background: #ea580c; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
          </div>
          <div style="text-align: left;">
            <p style="margin: 0; font-weight: 900; font-size: 15px; color: #1f2937;">${title}</p>
            <p style="margin: 0; font-size: 13px; color: #6b7280; margin-top: 2px;">${message}</p>
          </div>
        </div>
      `,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  };

  const fetchStatus = useCallback(async () => {
    try {
      // 🟢 แก้ไข: ยิงไปที่ /api/history (ลบคำว่า /user ออก)
      const res = await axios.get(`${API_URL}/api/history`, { headers: { Authorization: `Bearer ${token}` } });
      const activeOrders = res.data.filter(o => o.status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'cooking');
      const sortedOrders = activeOrders.sort((a, b) => (b.ordersId || b.id) - (a.ordersId || a.id));
      
      setOrders(sortedOrders);

      res.data.forEach(order => {
        const currentId = order.ordersId || order.id;
        const prevStatus = prevStatusRef.current[currentId];
        
        if (prevStatus && prevStatus !== order.status) {
            if (order.status === 'cooking') showNotification(`อัปเดตคิว #${currentId}`, 'แม่ครัวรับออเดอร์แล้ว! กำลังเตรียมอาหารค่ะ 🍳');
            else if (order.status === 'completed') showNotification(`คิว #${currentId} เสร็จแล้ว!`, 'อาหารของคุณพร้อมเสิร์ฟ/จัดส่งแล้วค่ะ 🎉');
            else if (order.status === 'cancelled') showNotification(`คิว #${currentId} ถูกยกเลิก`, 'ขออภัยค่ะ คำสั่งซื้อของคุณถูกยกเลิก ❌');
        }
        prevStatusRef.current[currentId] = order.status;
      });
    } catch (err) { console.error("Fetch Status Error:", err); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); 
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    if (cancelModalOpen || receiptOrder) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [cancelModalOpen, receiptOrder]);

  const openCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    try {
      // 🟢 แก้ไข: ยิงไปที่ /api/cancel-order (ลบคำว่า /user ออก)
      await axios.put(`${API_URL}/api/cancel-order`, {
        id: orderToCancel, rejectReason: `[ลูกค้ายกเลิกเอง] ${cancelReason || 'ไม่ระบุเหตุผล'}` 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchStatus(); 
      setCancelModalOpen(false);
      setOrderToCancel(null);
      Swal.fire({ title: 'สำเร็จ', text: 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว ออเดอร์จะถูกย้ายไปที่ประวัติ', icon: 'success', timer: 2000, showConfirmButton: false });
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
        <div className="mb-6 flex flex-row items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-800 flex items-center gap-2 sm:gap-3">
                <span className="bg-orange-100 p-2 rounded-xl text-orange-600 shrink-0"><Clock size={24}/></span>
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
                <div className="flex flex-col gap-3 w-full">
                    <button onClick={() => navigate('/menu')} className="w-full py-4 bg-[#ea580c] text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex justify-center items-center gap-2 active:scale-95">สั่งอาหาร <ArrowRight size={20}/></button>
                </div>
            </div>
         ) : (
            <div className="space-y-6">
                {orders.map((order, idx) => {
                    const currentId = order.ordersId || order.id;
                    
                    return (
                    <div key={currentId} className={`bg-white p-6 rounded-[32px] shadow-sm border relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500 border-gray-100`} style={{animationDelay: `${idx * 100}ms`}}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border bg-orange-50 text-orange-500 border-orange-100">#{currentId}</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">เวลาสั่งซื้อ</p>
                                    <p className="text-lg font-bold text-gray-800">{new Date(order.createdAt || order.orderDate).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.</p>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${order.status === 'cooking' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                {order.status === 'cooking' ? 'กำลังปรุง' : 'รอรับออเดอร์'}
                            </div>
                        </div>

                        <OrderProgress status={order.status} />
                        
                        <div className="mt-5">
                            <div className="flex justify-between items-center px-2 mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <Receipt size={14} className="text-gray-400"/>
                                    {order.paymentMethod === 'transfer' ? 'โอนจ่าย' : 'เงินสด'}
                                </div>
                                <div className="text-right flex items-baseline gap-2">
                                    <span className="text-xs text-gray-400 font-bold uppercase">รวมสุทธิ</span>
                                    <span className="text-2xl font-black text-orange-500">฿{order.totalPrice || order.totalAmount}</span>
                                </div>
                            </div>

                            <button onClick={() => setReceiptOrder(order)} className="w-full mb-3 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 text-[14px]">
                                <ReceiptText size={18} className="text-gray-400" /> ดูรายละเอียดคำสั่งซื้อ (บิลใบเสร็จ)
                            </button>

                            {order.status === 'pending' && (
                              <div className="pt-3 border-t border-gray-100 border-dashed">
                                <button onClick={() => openCancelModal(currentId)} className="w-full py-3 bg-white hover:bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 text-[14px]">
                                  <XCircle size={18} /> ยกเลิกคำสั่งซื้อนี้
                                </button>
                              </div>
                            )}
                        </div>
                    </div>
                )})}
            </div>
         )}
      </div>

      {/* Modal บิลใบเสร็จ */}
      {receiptOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl relative animate-in zoom-in-95">
                <div className="bg-gray-50 py-5 text-center border-b border-gray-200 border-dashed relative">
                    <button onClick={() => setReceiptOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20}/></button>
                    <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-2"><ReceiptText size={24}/></div>
                    <h3 className="font-black text-xl text-gray-800 tracking-wider">ใบเสร็จรับเงิน</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">ออเดอร์ #{receiptOrder.ordersId || receiptOrder.id}</p>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="text-[13px] text-gray-500 flex justify-between">
                        <span>วันที่สั่งซื้อ:</span>
                        <span className="font-bold text-gray-800">{new Date(receiptOrder.createdAt || receiptOrder.orderDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} น.</span>
                    </div>
                    
                    <div className="border-t border-dashed border-gray-200 pt-4 pb-2 space-y-3">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">รายการอาหาร</p>
                        {receiptOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-[14px]">
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-gray-800 leading-tight">
                                    <span className="text-orange-500 mr-1.5">{item.quantity}x</span> 
                                    {item.product?.title || item.name}
                                </p>
                                {item.note && <p className="text-[12px] text-gray-500 mt-0.5 font-medium">↳ {item.note}</p>}
                            </div>
                            <span className="font-bold text-gray-800 shrink-0">฿{item.unitPrice || item.price}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-b border-dashed border-gray-200 py-4 flex justify-between items-center">
                        <span className="font-black text-gray-800">ยอดสุทธิ (Total)</span>
                        <span className="font-black text-3xl text-orange-500">฿{receiptOrder.totalPrice || receiptOrder.totalAmount}</span>
                    </div>
                    
                    <div className="text-[13px] text-gray-500 flex justify-between pt-2">
                        <span>ช่องทางชำระเงิน:</span>
                        <span className="font-bold text-gray-800">{receiptOrder.paymentMethod === 'transfer' ? 'โอนเงินเข้าบัญชี' : 'เงินสด'}</span>
                    </div>
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button onClick={() => setReceiptOrder(null)} className="w-full py-3.5 bg-gray-800 hover:bg-black text-white rounded-xl font-bold transition-colors active:scale-95 shadow-md">
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal ยกเลิก */}
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