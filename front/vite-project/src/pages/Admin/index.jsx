import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Home as HomeIcon, ShoppingBag, FileText, Users, Settings as SettingsIcon, 
  LogOut, Bell, Menu as MenuIcon, X, Store, ChevronRight, User
} from 'lucide-react';

import { API_URL } from '../../api';

// ✅ Import Pages
import Home from './Home';
import Orders from './Orders';  
import MenuManagement from './MenuManagement';
import Customers from './Customers';
import Settings from './Settings';

// ==========================================
// 🎨 SUB-COMPONENTS: UI Components
// ==========================================

/**
 * 📌 Sidebar - เมนูด้านข้าง
 * @param {boolean} isSidebarOpen - สถานะเปิด/ปิด
 * @param {function} setIsSidebarOpen - ตั้งค่าสถานะ
 * @param {object} shopInfo - ข้อมูลร้านค้า
 * @param {string} activeTab - แท็บที่ใช้งานอยู่
 * @param {function} handleMenuClick - จัดการคลิกเมนู
 * @param {function} handleLogout - ออกจากระบบ
 */
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, shopInfo, activeTab, handleMenuClick, handleLogout }) => {
  // ✅ กำหนดเมนูรายการต่างๆ
  const menuItems = [
    { id: 'home', label: 'หน้าหลัก', icon: HomeIcon },
    { id: 'orders', label: 'จัดการออเดอร์', icon: ShoppingBag },
    { id: 'menu', label: 'รายการอาหาร', icon: FileText },
    { id: 'customers', label: 'ข้อมูลลูกค้า', icon: Users },
    { id: 'settings', label: 'ตั้งค่าร้านค้า', icon: SettingsIcon },
  ];

  return (
    <>
      {/* ✅ Overlay ปิดเมื่อคลิกพื้นหลัง */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* ✅ Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out flex flex-col ${
        isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        
        {/* ✅ Shop Header Section */}
        <div className="relative p-6 pt-12 flex flex-col justify-end overflow-hidden bg-slate-900">
          {/* ✅ Close button */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute top-4 right-4 z-10 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X size={20} />
          </button>
          
          {/* ✅ Shop Info */}
          <div className="relative z-10 flex flex-col items-start py-4">
            <h2 className="font-bold text-xl text-white tracking-wide">{shopInfo.name}</h2>
            <p className="text-sm text-orange-400 font-medium">ผู้ดูแลระบบ (Admin)</p>
          </div>
        </div>

        {/* ✅ Menu Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon 
                    size={20} 
                    strokeWidth={1.5} 
                    className={isActive ? 'text-orange-500' : 'text-gray-500'} 
                  />
                  <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                </div>
                <ChevronRight size={18} className={isActive ? 'text-orange-500' : 'text-gray-300'} />
              </button>
            );
          })}
        </nav>

        {/* ✅ Logout Button */}
        <div className="p-4 mb-4 border-t border-gray-100 pt-6">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-4 w-full p-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
          >
            <LogOut size={20} strokeWidth={2} /> ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
};

/**
 * 📌 Topbar - แถบด้านบน
 * @param {string} activeTab - แท็บปัจจุบัน
 * @param {function} setIsSidebarOpen - เปิดปิด sidebar
 * @param {function} setShowProfileModal - เปิด Profile modal
 */
const Topbar = ({ activeTab, setIsSidebarOpen, setShowProfileModal }) => {
  // ✅ ฟังก์ชันดึงชื่อหน้า
  const getTitle = () => {
    const titleMap = {
      'home': 'หน้าหลัก',
      'orders': 'จัดการออเดอร์',
      'menu': 'รายการอาหาร',
      'customers': 'ข้อมูลลูกค้า',
      'settings': 'ตั้งค่าร้านค้า',
    };
    return titleMap[activeTab] || '';
  };

  return (
    <header className="py-3 px-4 sm:px-6 flex justify-between items-center shadow-sm z-10 relative border-b border-gray-200 bg-white min-h-[76px]">
      {/* ✅ Left Section: Menu & Title */}
      <div className="flex items-center gap-3 relative z-10">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition active:scale-95"
        >
          <MenuIcon size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          {getTitle()}
        </h1>
      </div>

      {/* ✅ Right Section: Notification & Profile */}
      <div className="flex items-center gap-3 md:gap-4 relative z-10">
        {/* ✅ Notification Bell */}
        <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors active:scale-95">
          <Bell size={20} />
        </button>

        {/* ✅ Admin Profile Button */}
        <button 
          onClick={() => setShowProfileModal(true)} 
          className="flex items-center gap-2 md:gap-3 bg-orange-50/50 hover:bg-orange-50 py-1.5 px-3 md:px-4 rounded-full border border-orange-100 transition-colors cursor-pointer relative z-50 active:scale-95"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 text-orange-600 rounded-full flex items-center justify-center shrink-0 border border-orange-200 bg-white">
            <User size={16} strokeWidth={2.5} />
          </div>
          <div className="text-left pr-1 md:pr-2 leading-none hidden sm:block">
            <p className="text-[14px] md:text-[15px] font-black text-gray-900 tracking-tight">Admin</p>
            <p className="text-[10px] md:text-[11px] font-bold text-gray-500 mt-0.5 whitespace-nowrap">ผู้จัดการร้าน</p>
          </div>
        </button>
      </div>
    </header>
  );
};

/**
 * 📌 ProfileModal - Modal แสดงข้อมูล Admin
 * @param {boolean} showProfileModal - แสดง/ซ่อน modal
 * @param {function} setShowProfileModal - ตั้งค่าการแสดง
 * @param {object} shopInfo - ข้อมูลร้านค้า
 * @param {function} handleLogout - ฟังก์ชันออกจากระบบ
 * @param {function} setActiveTab - ตั้งค่าแท็บ
 */
const ProfileModal = ({ showProfileModal, setShowProfileModal, shopInfo, handleLogout, setActiveTab }) => {
  if (!showProfileModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-[380px] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95">
        
        {/* ✅ Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
          <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2">
            <Store size={20} className="text-orange-500" /> ข้อมูลผู้จัดการร้าน
          </h2>
          <button 
            onClick={() => setShowProfileModal(false)} 
            className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* ✅ Modal Content */}
        <div className="p-8 text-center bg-white">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
            <User size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-[22px] font-black text-gray-900">Admin</h3>
          <p className="text-[14px] font-bold text-gray-500 mt-1">
            ผู้จัดการร้าน {shopInfo.name}
          </p>
        </div>

        {/* ✅ Modal Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col gap-2.5">
          <button 
            onClick={() => { 
              setShowProfileModal(false); 
              setActiveTab('settings'); 
            }} 
            className="w-full bg-[#ea580c] hover:bg-orange-600 text-white font-black py-3.5 rounded-[16px] shadow-sm transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <Store size={18} /> ตั้งค่าร้านค้า
          </button>
          <button 
            onClick={handleLogout} 
            className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-[16px] transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 MAIN COMPONENT: Admin Dashboard
// ==========================================
/**
 * 📌 AdminDashboard - หน้าแรกสำหรับผู้ดูแลระบบ
 * - Sidebar: เมนูนำทาง
 * - Topbar: แถบด้านบน
 * - Content: เนื้อหาหน้า (Home, Orders, Menu, Customers, Settings)
 */
export default function AdminDashboard() {
  // ✅ Route Navigation
  const navigate = useNavigate();

  // ✅ State Management
  const [activeTab, setActiveTab] = useState('home'); // แท็บปัจจุบัน
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // สถานะ Sidebar
  const [showProfileModal, setShowProfileModal] = useState(false); // สถานะ Profile Modal
  const [shopInfo, setShopInfo] = useState({ 
    name: 'แม่ครัวตัวกลม', 
    logo: '' 
  }); // ข้อมูลร้านค้า

  // ✅ Fetch Shop Information
  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/shop`);
        // ✅ จัดการรูปแบบ response ที่อาจเป็น array หรือ object
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        
        if (data) {
          setShopInfo({ 
            name: data.name || data.shopName || data.shop_name || 'แม่ครัวตัวกลม', 
            logo: data.logo || data.image || data.shopImage || data.images || '' 
          });
        }
      } catch (err) { 
        console.error("🔴 Fetch shop info error:", err); 
      }
    };
    fetchShopInfo();
  }, []);

  // ✅ Logout Handler
  const handleLogout = () => {
    if (window.confirm('ยืนยันออกจากระบบ?')) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  // ✅ Menu Click Handler
  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // ปิด Sidebar หลังเลือกเมนู
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFC] font-sans relative">
      
      {/* ✅ Sidebar Navigation */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        shopInfo={shopInfo}
        activeTab={activeTab}
        handleMenuClick={handleMenuClick}
        handleLogout={handleLogout}
      />

      {/* ✅ Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* ✅ Top Navigation Bar */}
        <Topbar
          activeTab={activeTab}
          setIsSidebarOpen={setIsSidebarOpen}
          setShowProfileModal={setShowProfileModal}
        />

        {/* ✅ Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8F9FA]">
          <div className="w-full animate-in slide-in-from-bottom-2 duration-300 pb-10">
            {/* ✅ Render Content Based on Active Tab */}
            {activeTab === 'home' && <Home />}
            {activeTab === 'orders' && <Orders />}
            {activeTab === 'menu' && <MenuManagement />}
            {activeTab === 'customers' && <Customers />}
            {activeTab === 'settings' && <Settings />}
          </div>
        </div>
      </main>

      {/* ✅ Admin Profile Modal */}
      <ProfileModal
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        shopInfo={shopInfo}
        handleLogout={handleLogout}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}