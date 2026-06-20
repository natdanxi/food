import React from 'react';
import { User, Phone, Clock, Utensils, XCircle, QrCode, Banknote, Receipt, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../../api';

const OrderCard = ({ order, setViewSlipImage, openRejectModal, handleStatusChange }) => {
  const isWalkin = !order.user || order.orderType === 'walkin';
  
  const customerName = isWalkin ? (order.customerInfo || 'ลูกค้าหน้าร้านทั่วไป') : `${order.user?.firstname || 'ไม่ระบุชื่อ'} ${order.user?.lastname || ''}`;
  const customerPhone = !isWalkin && order.user?.tel ? order.user.tel : null;

  const statusColors = {
    pending: 'bg-orange-500',
    cooking: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  };

  return (
    <div className={`bg-white rounded-[20px] shadow-sm flex flex-col relative overflow-hidden transition-all border border-gray-100 hover:shadow-md`}>
        <div className={`h-1.5 w-full ${statusColors[order.status] || 'bg-gray-200'}`}></div>

        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/40">
           <div>
               <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-[18px] font-black text-gray-900 leading-none">#{order.ordersId || order.id}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${isWalkin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isWalkin ? 'หน้าร้าน' : 'ออนไลน์'}
                  </span>
               </div>
               <div className="flex flex-col gap-0.5 mt-2">
                 <p className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5">
                   <User size={14} className="text-gray-400"/> {customerName}
                 </p>
                 {customerPhone && (
                   <p className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 ml-[2px]">
                     <Phone size={12} className="text-gray-400"/> {customerPhone}
                   </p>
                 )}
               </div>
           </div>
           <div className="text-right">
               <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-100 shadow-sm px-2.5 py-1 rounded-md flex items-center gap-1.5">
                 <Clock size={12} className="text-orange-500"/> {new Date(order.createdAt || order.orderDate).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
               </span>
           </div>
        </div>

        <div className="flex-1 p-5 space-y-4 bg-white">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">รายการที่สั่ง</p>
            {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                      {item.product?.image ? <img src={`${API_URL}/uploads/${item.product.image}`} className="w-full h-full object-cover" /> : <Utensils size={18} className="text-gray-300"/>}
                    </div>
                    <div className="flex-1 pt-0.5">
                        <p className="text-[14px] font-bold text-gray-800 leading-tight">
                          <span className="text-[#ea580c] mr-1.5">{item.quantity}x</span> 
                          {item.product?.title || item.name}
                        </p>
                        {item.note && (
                          <div className="mt-1.5 bg-orange-50 border border-orange-100 p-2 rounded-lg">
                            <p className="text-[12px] text-orange-700 font-medium leading-snug">↳ {item.note}</p>
                          </div>
                        )}
                    </div>
                </div>
            ))}

            {order.status === 'cancelled' && order.rejectReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-[11px] font-bold text-red-700 flex items-center gap-1.5 mb-1"><XCircle size={14}/> เหตุผลที่ยกเลิกออเดอร์</p>
                <p className="text-[12px] text-red-600 font-medium">{order.rejectReason}</p>
              </div>
            )}
        </div>

        <div className="p-4 bg-gray-50/60 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ช่องทางชำระเงิน</span>
                  {order.paymentMethod === 'transfer' ? (
                    <span className="text-[13px] font-bold text-blue-600 flex items-center gap-1.5"><QrCode size={16}/> โอนเงินเข้าบัญชี</span>
                  ) : (
                    <span className="text-[13px] font-bold text-emerald-600 flex items-center gap-1.5"><Banknote size={16}/> เงินสด</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">ยอดสุทธิ</span>
                  <span className="text-xl font-black text-[#ea580c] leading-none block">฿{order.totalPrice || order.totalAmount || 0}</span>
                </div>
            </div>
            
            {order.paymentMethod === 'transfer' && (
                <button 
                  onClick={() => {
                      const slipPath = order.slipImage || order.slip_image;
                      if (slipPath) {
                          setViewSlipImage(`${API_URL}/uploads/${slipPath}`);
                      } else {
                          Swal.fire({
                            title: 'ไม่พบสลิป',
                            text: 'ลูกค้าไม่ได้แนบสลิปโอนเงินมาครับ',
                            icon: 'info'
                          });
                      }
                  }} 
                  className="w-full mb-3 flex items-center justify-center gap-2 text-[13px] bg-white border border-blue-200 text-blue-600 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <Receipt size={16}/> ตรวจสอบสลิปโอนเงิน
                </button>
            )}

            {order.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => openRejectModal(order.ordersId || order.id)} className="flex-1 py-3 border-2 border-red-100 text-red-500 bg-white rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-colors">ปฏิเสธ</button>
                <button onClick={() => handleStatusChange(order.ordersId || order.id, 'cooking')} className="flex-[2] py-3 bg-[#ea580c] hover:bg-orange-600 text-white rounded-xl text-[15px] font-black shadow-md shadow-orange-200 transition-all active:scale-95">รับออเดอร์</button>
              </div>
            )}
            {order.status === 'cooking' && (
              <button onClick={() => handleStatusChange(order.ordersId || order.id, 'completed')} className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[15px] font-black shadow-md shadow-green-200 transition-all active:scale-95 flex justify-center items-center gap-2">
                <CheckCircle size={20}/> ทำเสร็จแล้ว (เสิร์ฟ)
              </button>
            )}
        </div>
    </div>
  );
};

export default OrderCard;   