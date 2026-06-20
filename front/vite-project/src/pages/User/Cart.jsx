import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api';
import { ChevronLeft, Trash2, Minus, Plus, CreditCard, Banknote, Edit3, X, QrCode, Upload, Receipt, Loader2, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Swal from 'sweetalert2';

const ADDONS_LIST = [
  { name: 'ไข่ดาว', price: 5 }, { name: 'ไข่เจียว', price: 5 },
  { name: 'พิเศษ', price: 5 }, { name: 'เพิ่มข้าว', price: 5 }
];

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const slipInputRef = useRef(null);
  const [qrSrc, setQrSrc] = useState(`${API_URL}/uploads/shop-qrcode.jpg`);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editAddons, setEditAddons] = useState([]);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนเข้าหน้าตะกร้าครับ', 'warning').then(() => navigate('/menu'));
      return;
    }
    const saved = localStorage.getItem('cart');
    if (saved) setCartItems(JSON.parse(saved));
    axios.get(`${API_URL}/api/shop`).then(res => setShopInfo(res.data)).catch(err => console.log(err));
  }, [navigate]);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const openEditModal = (index, item) => {
    setEditIndex(index);
    let noteText = item.note || '';
    let currentAddons = [];
    
    ADDONS_LIST.forEach(addon => {
        if (noteText.includes(addon.name)) {
            currentAddons.push(addon.name);
            noteText = noteText.replace(addon.name, '').replace('เพิ่ม:', '').replace('|', '').trim();
        }
    });
    noteText = noteText.replace(/,\s*/g, '').trim();

    setEditAddons(currentAddons);
    setEditNote(noteText);
    setEditModalOpen(true);
  };

  const saveEditDetails = () => {
    const newCart = [...cartItems];
    const item = newCart[editIndex];

    const addonsText = editAddons.length > 0 ? `เพิ่ม: ${editAddons.join(', ')}` : '';
    const finalNote = [addonsText, editNote].filter(Boolean).join(' | ');
    const addonsPrice = editAddons.length * 5; 

    let oldAddonsCount = 0;
    ADDONS_LIST.forEach(a => { if (item.note && item.note.includes(a.name)) oldAddonsCount++; });
    const basePrice = item.price - (oldAddonsCount * 5);

    newCart[editIndex] = { ...item, note: finalNote, price: basePrice + addonsPrice };
    saveCart(newCart);
    setEditModalOpen(false);
  };

  const confirmOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    setIsSubmitting(true);
    try {
      let payload;
      const headers = { Authorization: `Bearer ${token}` };

      const formattedItems = cartItems.map(item => ({
        id: item.product_id || item.id, 
        product_id: item.product_id || item.id,
        price: item.price,
        quantity: item.quantity,
        note: item.note || ''
      }));

      const overallNote = cartItems.map(item => item.note).filter(Boolean).join(' | ');

      if (paymentMethod === 'transfer' && slipFile) {
        payload = new FormData();
        payload.append('items', JSON.stringify(formattedItems));
        payload.append('totalPrice', totalPrice);
        payload.append('totalAmount', totalPrice);
        payload.append('paymentMethod', paymentMethod);
        payload.append('orderType', 'online');
        payload.append('note', overallNote);
        payload.append('slip', slipFile);
      } else {
        payload = {
          items: formattedItems,
          totalPrice: totalPrice,
          totalAmount: totalPrice,
          paymentMethod: paymentMethod,
          orderType: 'online',
          note: overallNote
        };
      }

      await axios.post(`${API_URL}/api/user/order`, payload, { headers });
      
      localStorage.removeItem('cart');
      setShowPaymentModal(false);
      setCartItems([]);
      Swal.fire({ title: 'สำเร็จ!', text: 'ส่งคำสั่งซื้อเรียบร้อยแล้ว', icon: 'success', timer: 2000, showConfirmButton: false }).then(() => { navigate('/status'); });
    } catch (err) {
      Swal.fire('สั่งซื้อไม่สำเร็จ', err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างออเดอร์', 'error');
    } finally { setIsSubmitting(false); }
  };

  if (cartItems.length === 0) return ( 
    <div className="min-h-screen bg-gray-50 flex flex-col"><Navbar /><div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6"><ShoppingBag size={48} className="text-orange-300" /></div><h2 className="text-2xl font-black text-gray-800">ตะกร้าว่างเปล่า</h2><button onClick={() => navigate('/menu')} className="mt-8 px-8 py-3.5 bg-[#ea580c] text-white rounded-[16px] font-black shadow-md active:scale-95 transition-all">ไปเลือกอาหาร</button></div></div> 
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      <Navbar />
      <div className="bg-white h-[60px] flex items-center px-4 border-b sticky top-0 z-20 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} className="text-gray-800"/></button>
        <h1 className="text-[18px] font-black text-gray-900">ตะกร้าของฉัน</h1>
      </div>

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        {cartItems.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-[20px] shadow-sm flex gap-4 relative border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-50">
               {item.image ? <img src={`${API_URL}/uploads/${item.image}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex justify-center items-center text-xs text-gray-400">ไม่มีรูป</div>}
            </div>
            <div className="flex-1 flex flex-col">
               <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-[15px]">{item.title || item.name}</h3>
                  <button onClick={() => {if(window.confirm("ลบเมนูนี้?")) saveCart(cartItems.filter((_,i)=>i!==idx));}} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
               </div>
               
               {item.note ? (
                 <button onClick={() => openEditModal(idx, item)} className="text-[11px] text-orange-500 font-bold bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-md w-fit mt-1 flex items-center gap-1.5 cursor-pointer text-left transition-colors">
                   <Edit3 size={12}/> {item.note}
                 </button>
               ) : (
                 <button onClick={() => openEditModal(idx, item)} className="text-[11px] text-gray-400 font-medium bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-md w-fit mt-1 flex items-center gap-1.5 cursor-pointer transition-colors">
                   <Plus size={12}/> เพิ่มรายละเอียด/ตัวเลือก
                 </button>
               )}

               <div className="flex justify-between items-center mt-auto">
                  <p className="text-[#ea580c] font-black text-[18px]">฿{item.price * item.quantity}</p>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-1">
                     <button onClick={()=>{const nc=[...cartItems]; if(nc[idx].quantity>1) nc[idx].quantity--; saveCart(nc);}} className="text-gray-400 hover:bg-gray-100 rounded-full p-0.5"><Minus size={14}/></button>
                     <span className="font-bold text-[14px] w-4 text-center">{item.quantity}</span>
                     <button onClick={()=>{const nc=[...cartItems]; nc[idx].quantity++; saveCart(nc);}} className="text-gray-400 hover:bg-gray-100 rounded-full p-0.5"><Plus size={14}/></button>
                  </div>
               </div>
            </div>
          </div>
        ))}

        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 mt-2">
          <h3 className="font-bold text-gray-800 mb-4 text-[15px] flex items-center gap-2"><CreditCard size={18} className="text-blue-500"/> วิธีการชำระเงิน</h3>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={()=>setPaymentMethod('transfer')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 relative transition-all ${paymentMethod==='transfer'?'border-orange-500 bg-orange-50 text-orange-600':'border-gray-100 text-gray-500 hover:bg-gray-50'}`}><QrCode size={24}/> <span className="text-[13px] font-bold">โอนจ่าย (QR)</span>{paymentMethod==='transfer' && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}</button>
             <button onClick={()=>setPaymentMethod('cash')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 relative transition-all ${paymentMethod==='cash'?'border-orange-500 bg-orange-50 text-orange-600':'border-gray-100 text-gray-500 hover:bg-gray-50'}`}><Banknote size={24}/> <span className="text-[13px] font-bold">เงินสดหน้าร้าน</span>{paymentMethod==='cash' && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}</button>
          </div>
          {paymentMethod === 'transfer' && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-600 text-[12px] font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> กรุณาเตรียมสลิปโอนเงินเพื่อแสดงตอนรับอาหาร
              </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-30 rounded-t-[24px]">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
             <div><p className="text-[11px] text-gray-400 font-bold uppercase mb-0.5">ยอดรวมสุทธิ</p><p className="text-[26px] font-black text-orange-500 leading-none">฿{totalPrice}</p></div>
             <button onClick={()=>paymentMethod==='transfer'?setShowPaymentModal(true):confirmOrder()} className="bg-[#ea580c] text-white px-10 py-3.5 rounded-[16px] font-black shadow-md active:scale-95 transition-all flex items-center gap-2">ยืนยันสั่งซื้อ <Receipt size={18}/></button>
          </div>
      </div>

      {/* Modal แก้ไข Add-ons */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[420px] rounded-[24px] p-6 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-black text-gray-900">แก้ไขรายละเอียด</h2>
              <button onClick={() => setEditModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18}/></button>
            </div>
            <div className="mb-6 space-y-3">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">ตัวเลือกพิเศษ (บวกเพิ่ม)</p>
              <div className="grid grid-cols-2 gap-3">
                {ADDONS_LIST.map((addon, i) => (
                  <button key={i} onClick={() => setEditAddons(prev => prev.includes(addon.name) ? prev.filter(a => a !== addon.name) : [...prev, addon.name])} className={`flex justify-between border rounded-xl px-3 py-2.5 transition-all active:scale-95 ${editAddons.includes(addon.name) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'}`}>
                    <span className="text-[13px] font-bold">{addon.name}</span><span className="text-[12px]">+฿{addon.price}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-3">หมายเหตุอื่นๆ (ถ้ามี)</p>
              <input type="text" value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="เช่น ไม่เผ็ด, แยกน้ำ..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all">ยกเลิก</button>
              <button onClick={saveEditDetails} className="flex-1 bg-[#ea580c] hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ชำระเงิน */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[400px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-black text-gray-900 text-[18px]">ชำระเงินผ่านการโอน</h2>
              <button onClick={()=>setShowPaymentModal(false)} className="bg-white p-1.5 rounded-full text-gray-400 hover:text-gray-800 border shadow-sm transition-all"><X size={18}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-[13px] font-bold text-gray-500">สแกน QR เพื่อโอนเงินเข้าบัญชีร้าน</p>
                <div className="w-44 h-44 bg-white mx-auto rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center p-2 shadow-sm overflow-hidden relative">
                  <img 
                    src={qrSrc} 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      if (qrSrc.endsWith('.jpg')) {
                        setQrSrc(`${API_URL}/uploads/shop-qrcode.png`);
                      } else {
                        e.target.style.display = 'none';
                        e.target.insertAdjacentHTML('afterend', '<div class="text-gray-300 text-xs flex flex-col items-center mt-12"><p class="mt-2 font-bold">ร้านยังไม่มี QR</p></div>');
                      }
                    }}
                  />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-6 text-left">
                <p className="text-[13px] font-bold text-gray-700 mb-4">แนบหลักฐานการโอนเงิน (ไม่บังคับ)</p>
                {!slipPreview ? (
                  <button onClick={()=>slipInputRef.current.click()} className="w-full py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center gap-2 text-gray-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50 transition-all"><Upload size={32}/><span className="text-[13px] font-bold">กดเพื่อเลือกรูปภาพสลิป</span></button>
                ) : (
                  <div className="relative w-full aspect-[3/4] max-h-60 bg-gray-100 rounded-[24px] overflow-hidden border border-gray-200 shadow-inner">
                    <img src={slipPreview} className="w-full h-full object-contain" />
                    <button onClick={()=>{setSlipFile(null); setSlipPreview(null);}} className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-all"><X size={16}/></button>
                  </div>
                )}
                <input type="file" ref={slipInputRef} accept="image/*" className="hidden" onChange={(e)=>{const f=e.target.files[0]; if(f){setSlipFile(f); setSlipPreview(URL.createObjectURL(f));}}} />
              </div>
            </div>
            <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
              <button onClick={confirmOrder} disabled={isSubmitting} className="w-full bg-[#ea580c] hover:bg-orange-600 text-white py-4 rounded-[16px] font-black text-[16px] shadow-lg shadow-orange-200 flex justify-center items-center gap-2 active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin"/> : "ยืนยันการแจ้งโอน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}