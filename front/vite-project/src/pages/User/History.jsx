import React, { useState, useEffect } from 'react';
import { ReceiptText, CheckCircle, Loader2, Store, Clock, XCircle, ShoppingBag, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';
import Navbar from '../../components/Navbar'; 
import Swal from 'sweetalert2';

const History = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // 🟢 แก้ไข: ยิงไปที่ /api/history (ลบคำว่า /user ออก)
        const res = await axios.get(`${API_URL}/api/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    if(token) fetchHistory();
  }, [token]);

  const handleReorder = (order) => {
    let currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    order.items.forEach(item => {
      const prodId = item.product?.productId || item.productId || item.product?.id;
      const existingItemIndex = currentCart.findIndex(cartItem => cartItem.product_id === prodId);
      
      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += item.quantity;
      } else if (item.product) {
        currentCart.push({
          id: prodId,
          product_id: prodId,
          title: item.product.title || item.product.name,
          name: item.product.title || item.product.name,
          price: item.unitPrice || item.price || item.product.price,
          image: item.product.image || item.product.images, 
          quantity: item.quantity,
          note: item.note || ''
        });
      }
    });
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('storage')); 
    
    Swal.fire({
      toast: true, position: 'top-end', icon: 'success', 
      title: 'เพิ่มเมนูลงตะกร้าแล้ว!', showConfirmButton: false, timer: 1500
    });
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'pending' || order.status === 'cooking';
    if (activeTab === 'completed') return order.status === 'completed';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'completed': return { text: 'สำเร็จแล้ว', color: 'text-green-600' };
      case 'pending': 
      case 'cooking': return { text: 'กำลังดำเนินการ', color: 'text-orange-500' };
      case 'cancelled': return { text: 'ยกเลิกแล้ว', color: 'text-red-500' };
      default: return { text: 'ไม่ทราบสถานะ', color: 'text-gray-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      <Navbar />
      
      <div className="bg-white shadow-sm sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'pending', label: 'กำลังดำเนินการ' },
              { id: 'completed', label: 'สำเร็จแล้ว' },
              { id: 'cancelled', label: 'ยกเลิกแล้ว' },
            ].map(tab => (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] py-3 text-sm font-bold text-center border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-orange-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-2 sm:p-4 mt-2">
        {loading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-orange-500" size={32}/></div> 
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ReceiptText size={48} className="mb-4 opacity-20" />
            <p>ยังไม่มีรายการคำสั่งซื้อ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const currentId = order.ordersId || order.id;
              const statusDisplay = getStatusDisplay(order.status);
              
              return (
                <div key={currentId} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${order.status === 'cancelled' ? 'border-red-200' : 'border-gray-200'}`}>
                  
                  <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Store size={18} className="text-gray-600" />
                      <span className="font-bold text-gray-800 text-sm">แม่ครัวตัวกลม <span className="text-gray-400 font-medium text-xs ml-1">(#{currentId})</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold ${statusDisplay.color}`}>
                        {statusDisplay.text}
                      </span>
                    </div>
                  </div>

                  {order.status === 'cancelled' && (
                    <div className="bg-red-50 px-3 sm:px-4 py-3 border-b border-red-100 flex items-start gap-2">
                      <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-red-700 block">เหตุผลที่ถูกยกเลิก:</span>
                        <span className="text-xs text-red-600">{order.rejectReason || 'ไม่ได้ระบุเหตุผล'}</span>
                      </div>
                    </div>
                  )}

                  <div className={`bg-gray-50/50 p-3 sm:p-4 space-y-3 ${order.status === 'cancelled' ? 'opacity-70 grayscale' : ''}`}>
                    {order.items.map((item, idx) => {
                      const imageName = item.product?.image || item.product?.images;
                      const imageSrc = imageName ? `${API_URL}/uploads/${imageName}` : null;
                      
                      return (
                        <div key={idx} className="flex gap-3">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-md border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {imageSrc ? (
                              <img src={imageSrc} alt={item.product?.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                            ) : (
                              <ShoppingBag size={20} className="text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="font-medium text-gray-800 text-sm sm:text-base line-clamp-1">{item.product?.title || item.product?.name || 'เมนูที่ถูกลบ'}</span>
                                {item.note && <span className="text-[11px] text-gray-500 mt-0.5 block line-clamp-1">↳ {item.note}</span>}
                              </div>
                              <span className="text-sm text-gray-800 font-medium shrink-0">฿{item.unitPrice || item.price || item.product?.price || 0}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-bold">x{item.quantity}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 p-3 sm:p-4 flex justify-between items-center bg-white">
                    <span className="text-xs text-gray-400 flex flex-col">
                      <span>ชำระผ่าน: {order.paymentMethod === 'transfer' ? 'โอนจ่าย' : 'เงินสด'}</span>
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600 mr-2">ยอดคำสั่งซื้อทั้งหมด:</span>
                      <span className={`text-lg font-bold ${order.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-orange-600'}`}>฿{order.totalPrice || order.totalAmount}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
                    <span className="text-xs text-gray-400 order-2 sm:order-1">
                      สั่งเมื่อ: {new Date(order.createdAt || order.orderDate).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                    
                    <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                      {(order.status === 'completed' || order.status === 'cancelled') && (
                        <button onClick={() => handleReorder(order)} className="flex-1 sm:flex-none px-6 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-sm shadow-sm transition font-bold">
                          สั่งซื้ออีกครั้ง
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;