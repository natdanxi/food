import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Store, Clock, MapPin, Phone, UploadCloud, Trash2, QrCode } from 'lucide-react';
import { API_URL } from '../../api';
import Navbar from '../../components/Navbar.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// 🟢 ยึดตาม Backend 100% (เช็คค่า Boolean จาก isOpen)
export function isShopOpen(openTime, closeTime, isOpen) {
  return isOpen === true || String(isOpen) === 'true';
}

export function formatThaiTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  return `${h}:${m} น.`;
}

const LogoSection = ({ shopData, logoPreview, logoInputRef, setLogoFile, setLogoPreview, setRemoveLogo, setDeleteConfirm }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 mt-6">
    <div className="h-40 bg-gradient-to-r from-orange-400 to-orange-500"></div>
    <div className="flex flex-col items-center -mt-20 relative z-10 px-4 pb-6">
      <div className="w-40 h-40 bg-white rounded-full p-3 shadow-xl border-4 border-white">
        <div className="w-full h-full rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
          {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : <Store size={56} className="text-gray-400" />}
        </div>
      </div>
      <h2 className="text-2xl font-black text-gray-900 mt-4">{shopData.shopName || 'ชื่อร้านค้า'}</h2>
      <div className="flex gap-2 mt-4">
        <button onClick={() => logoInputRef.current.click()} className="bg-orange-50 border border-orange-200 text-orange-600 px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-100 transition"><UploadCloud size={16}/> เปลี่ยนโลโก้</button>
        {logoPreview && <button onClick={() => setDeleteConfirm({show: true, type: 'logo'})} className="bg-red-50 text-red-500 px-3 py-2 rounded-xl border border-red-200 hover:bg-red-100 transition"><Trash2 size={18}/></button>}
      </div>
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {setLogoFile(e.target.files[0]); setLogoPreview(URL.createObjectURL(e.target.files[0])); setRemoveLogo(false);}} />
    </div>
  </div>
);

const GeneralInfoSection = ({ shopData, setShopData }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-3">ข้อมูลทั่วไป</h3>
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><Store size={14} className="text-orange-500" /> ชื่อร้าน</label>
        <input type="text" value={shopData.shopName} onChange={e => setShopData({...shopData, shopName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" placeholder="กรอกชื่อร้าน" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><Phone size={14} className="text-orange-500" /> เบอร์โทรศัพท์</label>
        <input type="tel" value={shopData.phone} onChange={e => setShopData({...shopData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" placeholder="กรอกเบอร์โทรศัพท์" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><MapPin size={14} className="text-orange-500" /> ที่ตั้งร้าน</label>
        <textarea rows="3" value={shopData.address} onChange={e => setShopData({...shopData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white resize-none transition" placeholder="กรอกที่ตั้งร้าน"></textarea>
      </div>
    </div>
  </div>
);

export default function ShopSettings() {
  const [shopData, setShopData] = useState({ shopName: '', phone: '', address: '', openTime: '08:30', closeTime: '16:00', isOpen: true });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  
  const [qrPreview, setQrPreview] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [removeQr, setRemoveQr] = useState(false);

  const [statusModal, setStatusModal] = useState({ show: false, type: '', title: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '' });

  const logoInputRef = useRef(null);
  const qrInputRef = useRef(null);

  useEffect(() => { 
    const fetchShopInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/shop`);
        if (res.data) {
          setShopData({ shopName: res.data.shopName || '', phone: res.data.phone || '', address: res.data.address || '', openTime: res.data.openTime || '08:30', closeTime: res.data.closeTime || '16:00', isOpen: res.data.isOpen ?? true });
          if (res.data.logo) setLogoPreview(`${API_URL}/uploads/${res.data.logo}`);
          checkQrImage();
        }
      } catch (err) { console.error(err); }
    };
    fetchShopInfo(); 
  }, []);

  const checkQrImage = () => {
    const qrUrl = `${API_URL}/uploads/shop-qrcode.jpg?t=${new Date().getTime()}`;
    const img = new Image();
    img.onload = () => setQrPreview(qrUrl);
    img.onerror = () => {
        const qrUrlPng = `${API_URL}/uploads/shop-qrcode.png?t=${new Date().getTime()}`;
        const imgPng = new Image();
        imgPng.onload = () => setQrPreview(qrUrlPng);
        imgPng.onerror = () => setQrPreview(null);
        imgPng.src = qrUrlPng;
    };
    img.src = qrUrl;
  };

  const handleSave = async () => {
    setStatusModal({ show: true, type: 'loading', title: 'โปรดรอสักครู่', message: 'กำลังบันทึกข้อมูล...' });
    try {
      const formData = new FormData();
      formData.append('name', shopData.shopName); 
      formData.append('phone', shopData.phone);
      formData.append('address', shopData.address); 
      formData.append('openTime', shopData.openTime);
      formData.append('closeTime', shopData.closeTime); 
      formData.append('isOpen', String(shopData.isOpen));
      if (logoFile) formData.append('logo', logoFile); formData.append('removeLogo', String(removeLogo));
      if (qrFile) formData.append('qrCode', qrFile); formData.append('removeQrCode', String(removeQr));

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/shop`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
      
      window.dispatchEvent(new Event('shopInfoUpdated'));
      setStatusModal({ show: true, type: 'success', title: 'สำเร็จ!', message: 'บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว' });
      setTimeout(() => setStatusModal({ show: false }), 2000);
      
      if (qrFile || removeQr) setTimeout(checkQrImage, 500);
    } catch (err) { 
        console.error(err);
        setStatusModal({ show: true, type: 'error', title: 'เกิดข้อผิดพลาด', message: 'บันทึกข้อมูลไม่สำเร็จ' }); 
    }
  };

  const confirmRemoveImage = () => {
    if (deleteConfirm.type === 'logo') { setLogoFile(null); setLogoPreview(null); setRemoveLogo(true); }
    else if (deleteConfirm.type === 'qr') { setQrFile(null); setQrPreview(null); setRemoveQr(true); }
    setDeleteConfirm({ show: false, type: '' });
  };

  const shopCurrentlyOpen = isShopOpen(shopData.openTime, shopData.closeTime, shopData.isOpen);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4">
        <LogoSection shopData={shopData} logoPreview={logoPreview} logoInputRef={logoInputRef} setLogoFile={setLogoFile} setLogoPreview={setLogoPreview} setRemoveLogo={setRemoveLogo} setDeleteConfirm={setDeleteConfirm} />

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6 mb-6">
          <GeneralInfoSection shopData={shopData} setShopData={setShopData} />

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-3">เวลาเปิดปิดร้าน</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><Clock size={14} className="text-green-500" /> เวลาเปิดร้าน</label>
                <input type="time" value={shopData.openTime} onChange={e => setShopData({...shopData, openTime: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
                <p className="text-xs text-gray-400 mt-1 pl-1">{formatThaiTime(shopData.openTime)}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><Clock size={14} className="text-red-500" /> เวลาปิดร้าน</label>
                <input type="time" value={shopData.closeTime} onChange={e => setShopData({...shopData, closeTime: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
                <p className="text-xs text-gray-400 mt-1 pl-1">{formatThaiTime(shopData.closeTime)}</p>
              </div>
            </div>
            <div className={`rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2 ${shopCurrentlyOpen ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              <span>{shopCurrentlyOpen ? '🟢' : '🔴'}</span>
              ขณะนี้ร้าน{shopCurrentlyOpen ? 'เปิดรับออเดอร์' : 'ปิดรับออเดอร์'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-3">ข้อมูลการชำระเงิน</h3>
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><QrCode size={18} className="text-orange-500" /> รูป QR Code สำหรับรับเงิน</p>
          <div className="w-full h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {qrPreview ? <img src={qrPreview} className="w-full h-full object-contain p-4" /> : <div className="text-center text-gray-400"><QrCode size={48} className="mx-auto mb-2 opacity-50" /><p className="text-xs">ยังไม่มี QR Code</p></div>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => qrInputRef.current.click()} className="flex-1 bg-orange-50 border border-orange-200 text-orange-600 px-5 py-3 rounded-xl text-sm font-bold hover:bg-orange-100 transition">อัปโหลดรูป QR</button>
            {qrPreview && <button onClick={() => setDeleteConfirm({show: true, type: 'qr'})} className="bg-red-50 text-red-500 px-4 py-3 rounded-xl border border-red-200 hover:bg-red-100 transition"><Trash2 size={20}/></button>}
          </div>
          <input type="file" ref={qrInputRef} className="hidden" accept="image/*" onChange={(e) => {setQrFile(e.target.files[0]); setQrPreview(URL.createObjectURL(e.target.files[0])); setRemoveQr(false);}} />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">สถานะการรับออเดอร์</h3>
              <p className={`text-sm font-bold ${shopData.isOpen ? 'text-green-600' : 'text-red-600'}`}>{shopData.isOpen ? '🟢 เปิดรับออเดอร์' : '🔴 ปิดรับออเดอร์'}</p>
            </div>
            <button onClick={() => setShopData({...shopData, isOpen: !shopData.isOpen})} className={`relative w-14 h-8 rounded-full transition-colors ${shopData.isOpen ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${shopData.isOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        <button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 mb-8">บันทึกการตั้งค่าทั้งหมด</button>
      </div>

      <ConfirmDialog isOpen={statusModal.show} type={statusModal.type} title={statusModal.title} message={statusModal.message} onConfirm={() => setStatusModal({ ...statusModal, show: false })} />
      <ConfirmDialog isOpen={deleteConfirm.show} type="warning" title="ยืนยันการลบ" message={`คุณต้องการลบ${deleteConfirm.type === 'logo' ? 'โลโก้' : 'QR Code'}นี้หรือไม่?`} onConfirm={confirmRemoveImage} onCancel={() => setDeleteConfirm({ show: false, type: '' })} confirmText="ลบข้อมูล" />
    </div>
  );
}