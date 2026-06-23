import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Store, Clock, Phone, MapPin, X, Info, Menu, ShoppingCart,User, ClipboardList, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';
import { API_URL } from '../api'; 
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [shopInfo, setShopInfo] = useState(null);
  const [shopStatus, setShopStatus] = useState({ isOpenNow: false, reason: '' });
  const [showShopModal, setShowShopModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    // 🟢 แก้ไข: ให้หน้าเว็บของลูกค้าตรงกับสวิตช์เปิด-ปิดที่แอดมินเพิ่งตั้งค่า 100%
    const fetchShopInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/shop`);
        const shop = res.data || {};
        setShopInfo(shop);
        
        const isCurrentlyOpen = shop.isOpen !== false;

        setShopStatus({
          isOpenNow: isCurrentlyOpen,
          reason: isCurrentlyOpen ? '' : 'แอดมินปิดรับออเดอร์ชั่วคราว'
        });
      } catch (err) { console.error("Failed to fetch shop status:", err); }
    };

    const fetchUserInfo = async () => {
      if (isLoggedIn) {
        try {
          const res = await axios.get(`${API_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserInfo(res.data);
        } catch (err) { console.error("Failed to fetch user:", err); }
      }
    };
  
    fetchShopInfo();
    fetchUserInfo();

    const interval = setInterval(() => {
      fetchShopInfo();
    }, 5000);

    return () => clearInterval(interval);

  }, [isLoggedIn, token]);

  useEffect(() => {
    if (showShopModal || isSidebarOpen || showProfileModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => document.body.style.overflow = 'auto'; 
  }, [showShopModal, isSidebarOpen, showProfileModal]);

  const handleLogout = () => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ")) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const handleProfileClick = () => {
    if (!isLoggedIn) return window.location.href = '/login';
    setShowProfileModal(true);
  };

  return (
    <>
      <nav className="bg-white h-[76px] px-4 md:px-8 flex justify-between items-center shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95 relative z-50 cursor-pointer">
            <Menu size={24} />
          </button>
          
          <button onClick={() => setShowShopModal(true)} className="flex items-center gap-1.5 md:gap-2.5 text-left hover:opacity-70 transition-all active:scale-95 group focus:outline-none">
            <h1 className="text-[18px] md:text-[22px] font-black text-gray-900 tracking-tight line-clamp-1 max-w-[120px] md:max-w-none">{shopInfo?.name || 'แม่ครัวตัวกลม'}</h1>
            <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 group-hover:bg-orange-50 group-hover:border-orange-200 group-hover:text-orange-500 transition-colors shrink-0"><Info size={12} className="text-gray-400 group-hover:text-orange-500" /></div>
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <button onClick={handleProfileClick} className="flex items-center gap-2 md:gap-3 bg-orange-50/50 hover:bg-orange-50 py-1.5 px-3 md:px-4 rounded-full border border-orange-100 transition-colors cursor-pointer relative z-50">
             <div className="w-7 h-7 md:w-8 md:h-8 text-orange-600 rounded-full flex items-center justify-center shrink-0 border border-orange-200 bg-white">
                <User size={16} strokeWidth={2.5} />
             </div>
             <div className="text-left pr-1 md:pr-2 leading-none">
                <p className="text-[14px] md:text-[15px] font-black text-gray-900 tracking-tight">{isLoggedIn ? (userInfo?.firstname || 'User') : 'Guest'}</p>
                <p className="text-[10px] md:text-[11px] font-bold text-gray-500 mt-0.5 whitespace-nowrap">{isLoggedIn ? 'สมาชิกทั่วไป' : 'ผู้เยี่ยมชม'}</p>
             </div>
          </button>
          
          {isLoggedIn && (
            <button onClick={() => window.location.href = '/cart'} className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-full flex items-center justify-center transition-colors relative active:scale-95 shrink-0 border border-orange-100 z-50">
              <ShoppingCart size={20} />
              <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          )}
        </div>
      </nav>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <div className={`fixed top-0 left-0 w-[280px] h-full bg-white z-[110] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="bg-[#141b2d] p-6 pb-8 relative flex flex-col items-center pt-12">
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-20"><X size={24} /></button>
          <div className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center text-orange-600 mb-4 shadow-md">
            <User size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-[20px] font-bold text-white leading-tight">{isLoggedIn ? `${userInfo?.firstname || 'User'} ${userInfo?.lastname || ''}` : 'ยินดีต้อนรับ'}</h2>
          <p className="text-[13px] text-gray-400 mt-1">{isLoggedIn ? userInfo?.email : 'กรุณาเข้าสู่ระบบเพื่อสั่งอาหาร'}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <a href="/menu" className="flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="flex items-center gap-4"><ShoppingBag size={20} className="text-gray-500" /><span className="font-bold text-[15px]">เมนูอาหาร</span></div>
            <ChevronRight size={16} className="text-gray-300" />
          </a>
          {isLoggedIn && (
            <>
              <a href="/status" className="flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center gap-4"><Clock size={20} className="text-gray-500" /><span className="font-bold text-[15px]">สถานะออเดอร์ (วันนี้)</span></div>
                <ChevronRight size={16} className="text-gray-300" />
              </a>
              <a href="/history" className="flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center gap-4"><ClipboardList size={20} className="text-gray-500" /><span className="font-bold text-[15px]">ประวัติการสั่งซื้อ</span></div>
                <ChevronRight size={16} className="text-gray-300" />
              </a>
              <a href="/profile" className="flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center gap-4"><User size={20} className="text-gray-500" /><span className="font-bold text-[15px]">แก้ไขข้อมูลส่วนตัว</span></div>
                <ChevronRight size={16} className="text-gray-300" />
              </a>
            </>
          )}
        </div>

        <div className="p-6">
          <button onClick={handleLogout} className={`flex items-center gap-3 font-bold text-[15px] transition-colors w-full text-left group ${isLoggedIn ? 'text-red-500 hover:text-red-600' : 'text-[#ea580c] hover:text-orange-700'}`}>
            <LogOut size={20} className={isLoggedIn ? "" : "rotate-180"} />
            {isLoggedIn ? 'ออกจากระบบ' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </div>

      {showShopModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[340px] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative pb-6">
            <div className="h-[130px] bg-[#ea580c] relative">
              <button onClick={() => setShowShopModal(false)} className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all z-20"><X size={18}/></button>
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-white rounded-[24px] p-1.5 shadow-lg">
                <div className="w-full h-full bg-gray-50 rounded-[18px] overflow-hidden flex items-center justify-center">
                  {shopInfo?.logo ? <img src={`${API_URL}/uploads/${shopInfo.logo}`} alt="Shop Logo" className="w-full h-full object-cover" /> : <Store size={36} className="text-gray-300"/>}
                </div>
              </div>
            </div>
            <div className="pt-16 px-6 text-center bg-white">
              <h2 className="text-[20px] font-black text-gray-900 mb-2 tracking-tight">{shopInfo?.name || 'แม่ครัวตัวกลม'}</h2>
              <div className="flex justify-center mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2 ${shopStatus?.isOpenNow ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${shopStatus?.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                  {shopStatus?.isOpenNow ? 'เปิดให้บริการ (Open)' : shopStatus?.reason || 'ปิดให้บริการ'}
                </span>
              </div>
              <div className="space-y-3 mb-8 px-2 text-left">
                <div className="flex items-start gap-3"><MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" /><p className="text-[13px] font-medium text-gray-600 leading-relaxed">{shopInfo?.address || 'ไม่ระบุที่อยู่'}</p></div>
                <div className="flex items-center gap-3"><Phone size={18} className="text-gray-400 shrink-0" /><p className="text-[13px] font-black text-gray-700">{shopInfo?.phone || 'ไม่ระบุเบอร์โทรศัพท์'}</p></div>
                <div className="flex items-center gap-3"><Clock size={18} className="text-gray-400 shrink-0" /><p className="text-[13px] font-black text-gray-700">{shopInfo?.openTime || '08:30'} - {shopInfo?.closeTime || '16:00'} น.</p></div>
              </div>
              <button onClick={() => setShowShopModal(false)} className="w-full mx-auto bg-[#141b2d] hover:bg-black text-white font-bold py-3.5 rounded-[16px] transition-all active:scale-95 block">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[380px] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2"><User size={20} className="text-orange-500"/> ข้อมูลส่วนตัว</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:bg-gray-100"><X size={16}/></button>
            </div>

            <div className="p-6 space-y-4 bg-white">
              {userInfo ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ชื่อ-นามสกุล</label>
                    <p className="text-[15px] font-black text-gray-800 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">{userInfo.firstname} {userInfo.lastname}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">อีเมล (Email)</label>
                    <p className="text-[15px] font-bold text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">{userInfo.email}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">เบอร์โทรศัพท์</label>
                    <p className="text-[15px] font-black text-gray-800 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">{userInfo.tel || '-'}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ที่อยู่จัดส่ง</label>
                    <p className="text-[14px] font-medium text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 min-h-[60px]">{userInfo.address || '-'}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400 font-bold">กำลังโหลดข้อมูล...</div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col gap-2.5">
              <button onClick={() => { setShowProfileModal(false); navigate('/profile'); }} className="w-full bg-[#ea580c] hover:bg-orange-600 text-white font-black py-3.5 rounded-[16px] shadow-sm transition-all active:scale-95 flex justify-center items-center gap-2">
                <User size={18}/> แก้ไขข้อมูล
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;