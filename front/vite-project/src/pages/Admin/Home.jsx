   import React, { useState, useEffect } from 'react';
   import axios from 'axios';
   import { 
   Wallet, Utensils, Users, ChevronRight, Clock, 
   MonitorSmartphone, Store, Activity, Calendar, User, UserPlus, TrendingUp
   } from 'lucide-react';
   import { API_URL } from '../../api';

   import Modal from '../../components/ui/Modal';
   import StatusBadge from '../../components/ui/StatusBadge';

   // ==========================================
   // 🧠 HELPER: ฟังก์ชันประมวลผลข้อมูล
   // ==========================================
   const processDashboardData = (orders, products, users) => {
   const today = new Date();
   
   const isSameDay = (d1, d2) => {
      const date1 = new Date(d1); const date2 = new Date(d2);
      return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
   };

   const completedOrders = orders.filter(o => o.status?.toLowerCase() === 'completed');
   const todayOrders = orders.filter(o => isSameDay(o.createdAt, today));
   const pending = todayOrders.filter(o => o.status?.toLowerCase() === 'pending');
   const cooking = todayOrders.filter(o => o.status?.toLowerCase() === 'cooking');
   const completedToday = todayOrders.filter(o => o.status?.toLowerCase() === 'completed');
   
   const todaySales = completedToday.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

   // --- 📊 ข้อมูลสำหรับกราฟ (รายวัน, สัปดาห์, เดือน) ---
   // 1. รายวัน (แบ่งตามช่วงเวลา)
   const dailyData = [
      { label: '08:00', walkin: 0, online: 0 }, { label: '12:00', walkin: 0, online: 0 },
      { label: '16:00', walkin: 0, online: 0 }, { label: '20:00', walkin: 0, online: 0 }
   ];
   completedToday.forEach(o => {
         const hour = new Date(o.createdAt).getHours();
         let index = 0;
         if (hour >= 10 && hour < 14) index = 1;
         else if (hour >= 14 && hour < 18) index = 2;
         else if (hour >= 18) index = 3;
         
         if (o.orderType === 'walkin') dailyData[index].walkin += Number(o.totalAmount || 0);
         else dailyData[index].online += Number(o.totalAmount || 0);
   });

   // 2. รายสัปดาห์ (7 วันย้อนหลัง)
   const weeklyData = Array.from({length: 7}, (_, i) => {
         const d = new Date(); d.setDate(today.getDate() - 6 + i);
         const dayOrders = completedOrders.filter(o => isSameDay(o.createdAt, d));
         return {
            label: d.toLocaleDateString('th-TH', {weekday: 'short'}),
            walkin: dayOrders.filter(o => o.orderType === 'walkin').reduce((sum, o) => sum + Number(o.totalAmount||0), 0),
            online: dayOrders.filter(o => o.orderType !== 'walkin').reduce((sum, o) => sum + Number(o.totalAmount||0), 0)
         };
   });

   // 3. รายเดือน (4 สัปดาห์ล่าสุด)
   const monthlyData = Array.from({length: 4}, (_, i) => {
         return { label: `สัปดาห์ ${i+1}`, walkin: 0, online: 0 }; // ข้อมูลจำลองโครงสร้าง
   });
   completedOrders.filter(o => new Date(o.createdAt).getMonth() === today.getMonth()).forEach(o => {
         const date = new Date(o.createdAt).getDate();
         let weekIdx = Math.floor((date - 1) / 7);
         if (weekIdx > 3) weekIdx = 3;
         if (o.orderType === 'walkin') monthlyData[weekIdx].walkin += Number(o.totalAmount||0);
         else monthlyData[weekIdx].online += Number(o.totalAmount||0);
   });

   // --- 🍔 จัดกลุ่มเมนูอาหารตามหมวดหมู่ ---
   const groupedMenus = products.reduce((acc, curr) => {
         const cat = curr.category?.name || 'ไม่มีหมวดหมู่';
         if (!acc[cat]) acc[cat] = [];
         acc[cat].push(curr);
         return acc;
   }, {});

   // --- 👥 ข้อมูลลูกค้า ---
   const regularUsers = users.filter(u => u.role === 'user');
   const newUsers = [...regularUsers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

   return {
         stats: { 
         sales: todaySales, newOrdersCount: pending.length, cookingCount: cooking.length, 
         completedCount: completedToday.length, totalMenus: products.length, 
         totalCustomers: regularUsers.length, activeUsers: pending.length + cooking.length
         },
         recentOrders: orders.slice(0, 6),
         graphData: { daily: dailyData, weekly: weeklyData, monthly: monthlyData },
         groupedMenus,
         topMenus: [], // สามารถเพิ่ม logic นับเมนูขายดีได้
         customerDetails: { 
            onlineOrders: todayOrders.filter(o => o.orderType !== 'walkin').length, 
            walkinOrders: todayOrders.filter(o => o.orderType === 'walkin').length, 
            registered: regularUsers.length,
            newUsers: newUsers
         }
   };
   };

   // ==========================================
   // 🎨 COMPONENTS: กราฟเส้น (SVG Line Chart)
   // ==========================================
   const LineChart = ({ data }) => {
      const maxVal = Math.max(...data.map(d => Math.max(d.walkin, d.online)), 100);
      const height = 200;
      
      const getPoints = (key) => data.map((d, i) => {
         const x = (i / (data.length - 1)) * 100;
         const y = 100 - ((d[key] / maxVal) * 100);
         return `${x},${y}`;
      }).join(' ');

      return (
         <div className="relative w-full h-[250px] mt-6">
               <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400">
                  <span>{maxVal.toLocaleString()}</span>
                  <span>{(maxVal/2).toLocaleString()}</span>
                  <span>0</span>
               </div>
               <div className="absolute inset-0 ml-8 border-b border-l border-gray-200">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                     {/* เส้นหน้าร้าน (Walk-in) */}
                     <polyline fill="none" stroke="#a855f7" strokeWidth="2" points={getPoints('walkin')} className="drop-shadow-sm"/>
                     {/* เส้นออนไลน์ (Online) */}
                     <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={getPoints('online')} className="drop-shadow-sm"/>
                     
                     {/* จุดบนเส้น */}
                     {data.map((d, i) => (
                           <g key={i}>
                              <circle cx={`${(i / (data.length - 1)) * 100}`} cy={`${100 - ((d.walkin / maxVal) * 100)}`} r="2" fill="#a855f7" />
                              <circle cx={`${(i / (data.length - 1)) * 100}`} cy={`${100 - ((d.online / maxVal) * 100)}`} r="2" fill="#3b82f6" />
                           </g>
                     ))}
                  </svg>
               </div>
               <div className="absolute bottom-[-24px] left-8 right-0 flex justify-between text-[10px] text-gray-500 font-bold">
                  {data.map((d, i) => <span key={i} className="text-center w-8 -ml-4">{d.label}</span>)}
               </div>
         </div>
      );
   };

   // ==========================================
   // 🎨 SUB-COMPONENTS: เนื้อหา Modal
   // ==========================================

   const SalesModalContent = ({ graphData, todaySales }) => {
   const [timeRange, setTimeRange] = useState('weekly');
   const currentData = graphData[timeRange];

   return (
   <div className="animate-in fade-in p-2">
      <div className="flex flex-col md:flex-row gap-6">
         <div className="md:w-1/3 space-y-4">
               <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-lg shadow-orange-200">
                  <p className="text-sm font-bold opacity-80 mb-1">ยอดขายสุทธิ (วันนี้)</p>
                  <h3 className="text-4xl font-black">฿{todaySales.toLocaleString()}</h3>
               </div>
               <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500 mb-4">สัดส่วนยอดขายตามช่องทาง</p>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className="text-sm font-bold text-gray-700">หน้าร้าน (POS)</span></div><span className="font-black text-gray-900">฿{currentData.reduce((s, d)=>s+d.walkin, 0).toLocaleString()}</span></div>
                     <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm font-bold text-gray-700">ออนไลน์</span></div><span className="font-black text-gray-900">฿{currentData.reduce((s, d)=>s+d.online, 0).toLocaleString()}</span></div>
                  </div>
               </div>
         </div>
         
         <div className="md:w-2/3 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-gray-800 flex items-center gap-2"><TrendingUp size={18} className="text-orange-500"/> กราฟเปรียบเทียบยอดขาย</h4>
                  <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-bold">
                     <button onClick={()=>setTimeRange('daily')} className={`px-4 py-1.5 rounded-md transition-all ${timeRange==='daily'?'bg-white shadow-sm text-gray-900':'text-gray-500 hover:text-gray-700'}`}>วันนี้</button>
                     <button onClick={()=>setTimeRange('weekly')} className={`px-4 py-1.5 rounded-md transition-all ${timeRange==='weekly'?'bg-white shadow-sm text-gray-900':'text-gray-500 hover:text-gray-700'}`}>7 วัน</button>
                     <button onClick={()=>setTimeRange('monthly')} className={`px-4 py-1.5 rounded-md transition-all ${timeRange==='monthly'?'bg-white shadow-sm text-gray-900':'text-gray-500 hover:text-gray-700'}`}>เดือนนี้</button>
                  </div>
               </div>
               <LineChart data={currentData} />
               <div className="flex justify-center gap-6 mt-10 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-purple-500 rounded-full"></div> ยอดขายหน้าร้าน</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-blue-500 rounded-full"></div> ยอดขายออนไลน์</div>
               </div>
         </div>
      </div>
   </div>
   )};

   const AllMenusModalContent = ({ groupedMenus }) => (
   <div className="animate-in fade-in p-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
      <div className="space-y-8">
         {Object.entries(groupedMenus).map(([category, items], idx) => (
         <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
               <h3 className="text-lg font-black text-gray-800 mb-4 pb-2 border-b border-gray-100 border-dashed flex items-center gap-2">
                  <span className="w-2 h-6 bg-orange-500 rounded-full"></span> {category} <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length} รายการ</span>
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {items.map(menu => {
                     const isAvailable = menu.isAvailable === true || menu.is_available === true;
                     return (
                           <div key={menu.id} className={`border rounded-xl overflow-hidden bg-white shadow-sm hover:border-orange-300 transition-all ${!isAvailable ? 'opacity-50 grayscale' : 'border-gray-200'}`}>
                              <div className="h-24 bg-gray-50 relative">
                                 {menu.images ? <img src={`${API_URL}/uploads/${menu.images}`} className="w-full h-full object-cover"/> : <Utensils className="w-full h-full p-6 text-gray-300"/>}
                                 {!isAvailable && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-black tracking-widest">ปิดการขาย</div>}
                              </div>
                              <div className="p-3">
                                 <p className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{menu.title}</p>
                                 <span className="font-black text-[#ea580c] text-sm">฿{menu.price}</span>
                              </div>
                           </div>
                     );
                  })}
               </div>
         </div>
         ))}
      </div>
   </div>
   );

   const CustomersModalContent = ({ details, activeUsers }) => (
   <div className="space-y-6 animate-in fade-in p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* สรุปคิว */}
         <div className="bg-gradient-to-br from-green-500 to-emerald-600 border border-green-500 p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden shadow-lg shadow-green-200">
               <div className="relative z-10 text-white">
                  <p className="text-sm font-bold opacity-80 mb-1 flex items-center gap-2">
                     <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span></span>
                     จำนวนคิวออเดอร์ที่กำลังปรุง
                  </p>
                  <h3 className="text-5xl font-black">{activeUsers} <span className="text-lg font-bold opacity-80">คิว</span></h3>
               </div>
               <Activity size={80} className="text-white opacity-10 absolute -right-4 -bottom-4"/>
         </div>
         
         {/* สถิติลูกค้าวันนี้ */}
         <div className="grid grid-cols-2 gap-3">
               <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                  <MonitorSmartphone size={24} className="text-blue-500 mb-2"/>
                  <h4 className="text-3xl font-black text-gray-800">{details.onlineOrders}</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">ออเดอร์ออนไลน์ (วันนี้)</p>
               </div>
               <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                  <Store size={24} className="text-purple-500 mb-2"/>
                  <h4 className="text-3xl font-black text-gray-800">{details.walkinOrders}</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">ลูกค้าหน้าร้าน (วันนี้)</p>
               </div>
         </div>
      </div>

      {/* ลูกค้าสมัครใหม่ */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
         <div className="flex justify-between items-center mb-4">
               <h4 className="font-black text-gray-800 flex items-center gap-2"><UserPlus size={18} className="text-orange-500"/> ลูกค้าที่สมัครใหม่ (ล่าสุด)</h4>
               <span className="text-xs font-bold bg-orange-50 text-orange-600 px-3 py-1 rounded-full">สมาชิกรวม {details.registered} คน</span>
         </div>
         <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 text-[11px] text-gray-500 uppercase">
                           <th className="p-3 rounded-l-lg">ชื่อ-นามสกุล</th>
                           <th className="p-3">อีเมล</th>
                           <th className="p-3">เบอร์โทร</th>
                           <th className="p-3 rounded-r-lg">วันที่สมัคร</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                     {details.newUsers.length === 0 ? <tr><td colSpan="4" className="text-center py-6 text-gray-400 font-bold">ยังไม่มีลูกค้าใหม่</td></tr> : 
                     details.newUsers.map((u, idx) => (
                           <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="p-3 font-bold text-gray-800 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs"><User size={14}/></div> {u.firstname} {u.lastname}</td>
                              <td className="p-3 text-gray-600">{u.email}</td>
                              <td className="p-3 text-gray-600">{u.tel || '-'}</td>
                              <td className="p-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('th-TH')}</td>
                           </tr>
                     ))}
                  </tbody>
               </table>
         </div>
      </div>
   </div>
   );

   // ==========================================
   // 🚀 MAIN COMPONENT
   // ==========================================
   export default function Home() {
   const [loading, setLoading] = useState(true);
   const [activeModal, setActiveModal] = useState(null); 
   const [dashboardData, setDashboardData] = useState({
      stats: { sales: 0, newOrdersCount: 0, cookingCount: 0, completedCount: 0, totalMenus: 0, totalCustomers: 0, activeUsers: 0 },
      recentOrders: [], graphData: { daily: [], weekly: [], monthly: [] },
      groupedMenus: {}, customerDetails: { onlineOrders: 0, walkinOrders: 0, registered: 0, newUsers: [] }
   });

   useEffect(() => {
      const fetchDashboardData = async () => {
         try {
         const token = localStorage.getItem('token');
         if (!token) { window.location.href = '/login'; return; }
         const headers = { Authorization: `Bearer ${token}` };

         const [ordersRes, productsRes, usersRes] = await Promise.all([
               axios.get(`${API_URL}/api/orders`, { headers }).catch(() => ({ data: [] })),
               axios.get(`${API_URL}/api/product`).catch(() => ({ data: [] })),
               axios.get(`${API_URL}/api/users`, { headers }).catch(() => ({ data: [] }))
         ]);

         const processedData = processDashboardData(ordersRes.data || [], productsRes.data || [], usersRes.data || []);
         setDashboardData(processedData);
         } catch (err) { console.error("Dashboard Error:", err); } finally { setLoading(false); }
      };

      fetchDashboardData();
      const intervalId = setInterval(fetchDashboardData, 10000); 
      return () => clearInterval(intervalId);
   }, []);

   if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full"></div></div>;

   const { stats, recentOrders, graphData, groupedMenus, customerDetails } = dashboardData;

   const modalConfigs = {
      sales: { title: '📊 รายงานยอดขายและกราฟเปรียบเทียบ', content: <SalesModalContent graphData={graphData} todaySales={stats.sales} />, maxWidth: 'max-w-5xl' },
      menus: { title: '🍽️ เมนูอาหารทั้งหมดแบ่งตามหมวดหมู่', content: <AllMenusModalContent groupedMenus={groupedMenus} />, maxWidth: 'max-w-6xl' },
      customers: { title: '👥 สถิติลูกค้าและการใช้งาน', content: <CustomersModalContent details={customerDetails} activeUsers={stats.activeUsers} />, maxWidth: 'max-w-4xl' },
   };

   return (
      <div className="animate-in fade-in duration-300 pb-10 bg-[#f6f6f6] min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
         
         {/* 🔴 Section 1: Dashboard Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <div onClick={() => setActiveModal('sales')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-orange-300 transition-all group flex flex-col justify-center">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-500">ยอดขายวันนี้</span>
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Wallet size={20}/></div>
               </div>
               <h3 className="text-4xl font-black text-gray-900 group-hover:text-orange-500 transition-colors">฿{stats.sales.toLocaleString()}</h3>
         </div>
         
         <div onClick={() => setActiveModal('menus')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-300 transition-all group flex flex-col justify-center">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-500">เมนูที่เปิดขาย</span>
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Utensils size={20}/></div>
               </div>
               <h3 className="text-4xl font-black text-gray-900">{stats.totalMenus} <span className="text-sm font-bold text-gray-400">รายการ</span></h3>
         </div>
         
         <div onClick={() => setActiveModal('customers')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-green-300 transition-all group flex flex-col justify-center">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-green-600 flex items-center gap-2"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2.5 w-2.5 bg-green-500"></span></span> กำลังรอคิว</span>
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Activity size={20}/></div>
               </div>
               <h3 className="text-4xl font-black text-gray-900 group-hover:text-green-600 transition-colors">{stats.activeUsers} <span className="text-sm font-bold text-gray-400">คิว</span></h3>
         </div>

         <div onClick={() => setActiveModal('customers')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-purple-300 transition-all group flex flex-col justify-center">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-500">ลูกค้าสมาชิก</span>
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Users size={20}/></div>
               </div>
               <h3 className="text-4xl font-black text-gray-900">{stats.totalCustomers} <span className="text-sm font-bold text-gray-400">คน</span></h3>
         </div>
         </div>

         {/* 🔴 Section 2: Recent Orders Table */}
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-800">ออเดอร์ล่าสุด</h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
               <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4 font-bold">หมายเลข</th>
                  <th className="px-6 py-4 font-bold">ลูกค้า</th>
                  <th className="px-6 py-4 font-bold">ยอดสุทธิ</th>
                  <th className="px-6 py-4 font-bold">ช่องทาง</th>
                  <th className="px-6 py-4 font-bold text-right">สถานะ</th>
               </tr>
               </thead>
               <tbody className="text-sm divide-y divide-gray-50">
               {recentOrders.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center font-bold text-gray-400">ยังไม่มีรายการออเดอร์</td></tr>
               ) : (
                  recentOrders.map((order, idx) => (
                     <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                     <td className="px-6 py-4 text-gray-900 font-black">#{order.id}</td>
                     <td className="px-6 py-4 text-gray-700 font-bold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><User size={14}/></div>
                        {(!order.user || order.orderType === 'walkin') ? (order.customerInfo || 'ลูกค้าหน้าร้าน') : `${order.user?.firstname} ${order.user?.lastname || ''}`}
                     </td>
                     <td className="px-6 py-4 font-black text-orange-600">฿{Number(order.totalAmount || 0).toLocaleString()}</td>
                     <td className="px-6 py-4 text-gray-500 text-xs font-bold">{order.orderType === 'walkin' ? <span className="bg-purple-50 text-purple-600 border border-purple-100 px-2 py-1 rounded-md">หน้าร้าน</span> : <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md">ออนไลน์</span>}</td>
                     <td className="px-6 py-4 text-right"><StatusBadge status={order.status?.toLowerCase()} /></td>
                     </tr>
                  ))
               )}
               </tbody>
            </table>
         </div>
         </div>

         {/* 🔴 Dynamic Modal */}
         {activeModal && modalConfigs[activeModal] && (
         <Modal 
            isOpen={true} 
            onClose={() => setActiveModal(null)} 
            title={modalConfigs[activeModal].title} 
            maxWidth={modalConfigs[activeModal].maxWidth}
            bgHeader="bg-gray-50"
         >
            <div className="pb-4 pt-2">
               {modalConfigs[activeModal].content}
            </div>
         </Modal>
         )}
      </div>
   );
   }