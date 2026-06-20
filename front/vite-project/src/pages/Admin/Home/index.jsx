import React from 'react';
import { Wallet, Utensils, Users, Clock, Activity, User, TrendingUp, ChefHat, ReceiptText } from 'lucide-react';

// นำเข้าสมอง (Logic) 
import { useAdminHome } from '../../../hooks/useAdminHome';

// นำเข้า UI ย่อย
import Modal from '../../../components/ui/Modal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { SalesModalContent, AllMenusModalContent, QueueModalContent, CustomersModalContent } from './DashboardModals';

export default function Home() {
  const { loading, activeModal, setActiveModal, dashboardData } = useAdminHome();

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full"></div></div>;

  const { stats, recentOrders, graphData, groupedMenus, customerDetails, activeOrdersList } = dashboardData;

  const modalConfigs = {
    sales: { title: 'รายงานยอดขายและกราฟเปรียบเทียบ', icon: <ReceiptText size={20} className="text-orange-500"/>, content: <SalesModalContent graphData={graphData} todaySales={stats.sales} />, maxWidth: 'max-w-[1000px]' },
    menus: { title: 'เมนูอาหารทั้งหมดแบ่งตามหมวดหมู่', icon: <Utensils size={20} className="text-blue-500"/>, content: <AllMenusModalContent groupedMenus={groupedMenus} />, maxWidth: 'max-w-[1100px]' },
    queue: { title: 'คิวออเดอร์ที่กำลังรอทำ', icon: <ChefHat size={20} className="text-emerald-500"/>, content: <QueueModalContent activeOrders={activeOrdersList} />, maxWidth: 'max-w-[800px]' },
    customers: { title: 'สถิติลูกค้าและการใช้งาน', icon: <Users size={20} className="text-purple-500"/>, content: <CustomersModalContent details={customerDetails} />, maxWidth: 'max-w-[800px]' },
  };

  return (
    <div className="animate-in fade-in duration-300 pb-10 bg-[#f8fafc] min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* --- ส่วนการ์ดสถิติ 4 ใบ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        
        <div onClick={() => setActiveModal('sales')} className="group relative bg-white overflow-hidden p-6 rounded-[28px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(234,88,12,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[160px] flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-orange-500 opacity-[0.03] group-hover:scale-125 group-hover:opacity-10 transition-transform duration-500 rotate-12"><Wallet size={140} strokeWidth={1.5} /></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-200/50 group-hover:scale-110 transition-transform duration-300"><Wallet size={22} strokeWidth={2.5} /></div>
            <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm"><TrendingUp size={12} /> อัปเดตล่าสุด</span>
          </div>
          <div className="relative z-10 mt-6">
            <p className="text-[13px] font-bold text-gray-400 mb-1 tracking-wide">ยอดขายสุทธิ (วันนี้)</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight"><span className="text-orange-500 text-3xl mr-1">฿</span>{stats.sales.toLocaleString()}</h3>
          </div>
        </div>
        
        <div onClick={() => setActiveModal('menus')} className="group relative bg-white overflow-hidden p-6 rounded-[28px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[160px] flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-blue-500 opacity-[0.03] group-hover:scale-125 group-hover:opacity-10 transition-transform duration-500 -rotate-12"><Utensils size={140} strokeWidth={1.5} /></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform duration-300"><Utensils size={22} strokeWidth={2.5} /></div>
            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">หมวดหมู่ทั้งหมด</span>
          </div>
          <div className="relative z-10 mt-6 flex items-baseline gap-2">
            <div className="flex flex-col"><p className="text-[13px] font-bold text-gray-400 mb-1 tracking-wide">เมนูที่เปิดขาย</p><h3 className="text-4xl font-black text-gray-900 tracking-tight">{stats.totalMenus}</h3></div><span className="text-sm font-bold text-gray-400">รายการ</span>
          </div>
        </div>
        
        <div onClick={() => setActiveModal('queue')} className="group relative bg-white overflow-hidden p-6 rounded-[28px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[160px] flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-emerald-500 opacity-[0.03] group-hover:scale-125 group-hover:opacity-10 transition-transform duration-500 rotate-6"><ChefHat size={140} strokeWidth={1.5} /></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform duration-300"><Activity size={22} strokeWidth={2.5} /></div>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> กำลังดำเนินการ
            </span>
          </div>
          <div className="relative z-10 mt-6 flex items-baseline gap-2">
            <div className="flex flex-col"><p className="text-[13px] font-bold text-gray-400 mb-1 tracking-wide">คิวที่กำลังรอ/ทำ</p><h3 className="text-4xl font-black text-gray-900 tracking-tight">{stats.activeUsers}</h3></div><span className="text-sm font-bold text-gray-400">คิว</span>
          </div>
        </div>

        <div onClick={() => setActiveModal('customers')} className="group relative bg-white overflow-hidden p-6 rounded-[28px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(168,85,247,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[160px] flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-purple-500 opacity-[0.03] group-hover:scale-125 group-hover:opacity-10 transition-transform duration-500 -rotate-6"><Users size={140} strokeWidth={1.5} /></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200/50 group-hover:scale-110 transition-transform duration-300"><Users size={22} strokeWidth={2.5} /></div>
            <span className="bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">ลงทะเบียนในระบบ</span>
          </div>
          <div className="relative z-10 mt-6 flex items-baseline gap-2">
            <div className="flex flex-col"><p className="text-[13px] font-bold text-gray-400 mb-1 tracking-wide">ลูกค้าสมาชิก</p><h3 className="text-4xl font-black text-gray-900 tracking-tight">{stats.totalCustomers}</h3></div><span className="text-sm font-bold text-gray-400">คน</span>
          </div>
        </div>
      </div>

      {/* --- ส่วนตารางออเดอร์ล่าสุด --- */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-7 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><Clock className="text-orange-500" size={20}/> ออเดอร์ล่าสุด</h2>
          <span className="bg-gray-50 border border-gray-100 text-gray-600 text-[12px] font-bold px-4 py-1.5 rounded-full shadow-sm">{recentOrders.length} รายการ</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-wider font-bold border-b border-gray-100">
                <th className="px-7 py-4">หมายเลขคิว</th><th className="px-7 py-4">ลูกค้า</th><th className="px-7 py-4">ยอดสุทธิ</th><th className="px-7 py-4">ช่องทาง</th><th className="px-7 py-4 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="text-[14px] divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr><td colSpan="5" className="px-7 py-16 text-center font-bold text-gray-400">ยังไม่มีรายการออเดอร์ในขณะนี้</td></tr>
              ) : (
                recentOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-7 py-5 text-gray-900 font-black">#{order.ordersId || order.id}</td>
                    <td className="px-7 py-5 text-gray-700 font-bold flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 shadow-sm border border-white"><User size={14} strokeWidth={2.5}/></div>
                      {(!order.user || order.orderType === 'walkin') ? (order.customerInfo || 'ลูกค้าหน้าร้าน') : `${order.user?.firstname} ${order.user?.lastname || ''}`}
                    </td>
                    <td className="px-7 py-5 font-black text-orange-600 text-[15px]">฿{Number(order.totalPrice || order.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-7 py-5">
                      {order.orderType === 'walkin' ? <span className="bg-purple-50 border border-purple-100 text-purple-600 font-bold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider">หน้าร้าน</span>
                      : <span className="bg-blue-50 border border-blue-100 text-blue-600 font-bold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider">ออนไลน์</span>}
                    </td>
                    <td className="px-7 py-5 text-right"><StatusBadge status={order.status?.toLowerCase()} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal && modalConfigs[activeModal] && (
        <Modal 
          isOpen={true} onClose={() => setActiveModal(null)} 
          title={<div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shadow-inner">{modalConfigs[activeModal].icon}</div><span className="text-[18px] font-black text-gray-800">{modalConfigs[activeModal].title}</span></div>} 
          maxWidth={modalConfigs[activeModal].maxWidth} bgHeader="bg-white border-b border-gray-100"
        >
          {modalConfigs[activeModal].content}
        </Modal>
      )}
    </div>
  );
}