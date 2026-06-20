import React, { useState } from 'react';
import { Wallet, Utensils, Users, Clock, MonitorSmartphone, Store, UserPlus, TrendingUp, ChefHat, BarChart3, User } from 'lucide-react';
import { API_URL } from '../../../api';
import StatusBadge from '../../../components/ui/StatusBadge';
import LineChart from './LineChart';

export const SalesModalContent = ({ graphData, todaySales }) => {
  const [timeRange, setTimeRange] = useState('weekly');
  const currentData = graphData[timeRange];

  return (
  <div className="animate-in fade-in p-2 md:p-4">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/3 space-y-6">
              <div className="bg-gradient-to-br from-[#ff7a18] to-[#e52e71] p-8 rounded-[28px] text-white shadow-xl shadow-orange-200/50 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <p className="text-sm font-bold opacity-90 tracking-wide">ยอดขายสุทธิ (วันนี้)</p>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"><Wallet size={20} className="text-white"/></div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black relative z-10 tracking-tight"><span className="text-2xl opacity-80 mr-1">฿</span>{todaySales.toLocaleString()}</h3>
              </div>
              <div className="bg-white border border-gray-100 p-6 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <p className="text-sm font-black text-gray-800 mb-5 flex items-center gap-2"><BarChart3 size={18} className="text-gray-400"/> สัดส่วนช่องทางการขาย</p>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Store size={18}/></div>
                          <div><p className="text-[13px] font-bold text-gray-700">หน้าร้าน (POS)</p><p className="text-[11px] text-gray-400 font-medium">ลูกค้า Walk-in</p></div>
                        </div>
                        <span className="font-black text-gray-900 text-lg">฿{currentData.reduce((s, d)=>s+d.walkin, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><MonitorSmartphone size={18}/></div>
                          <div><p className="text-[13px] font-bold text-gray-700">ออนไลน์</p><p className="text-[11px] text-gray-400 font-medium">ลูกค้าสั่งผ่านเว็บ</p></div>
                        </div>
                        <span className="font-black text-gray-900 text-lg">฿{currentData.reduce((s, d)=>s+d.online, 0).toLocaleString()}</span>
                      </div>
                  </div>
              </div>
          </div>
          <div className="lg:w-2/3 bg-white border border-gray-100 p-6 md:p-8 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h4 className="font-black text-gray-800 text-lg flex items-center gap-2"><TrendingUp size={22} className="text-orange-500"/> กราฟเปรียบเทียบยอดขาย</h4>
                  <div className="bg-gray-100/80 p-1 rounded-xl flex text-[13px] font-bold shrink-0">
                      <button onClick={()=>setTimeRange('daily')} className={`px-5 py-2.5 rounded-lg transition-all ${timeRange==='daily'?'bg-white shadow-sm text-gray-900':'text-gray-500 hover:text-gray-700'}`}>วันนี้</button>
                      <button onClick={()=>setTimeRange('weekly')} className={`px-5 py-2.5 rounded-lg transition-all ${timeRange==='weekly'?'bg-white shadow-sm text-gray-900':'text-gray-500 hover:text-gray-700'}`}>7 วัน</button>
                      <button onClick={()=>setTimeRange('monthly')} className={`px-5 py-2.5 rounded-lg transition-all ${timeRange==='monthly'?'bg-white shadow-sm text-gray-900':'text-gray-500 hover:text-gray-700'}`}>เดือนนี้</button>
                  </div>
              </div>
              <div className="flex-1 mt-auto"><LineChart data={currentData} /></div>
              <div className="flex justify-center gap-8 mt-14 text-[13px] font-bold text-gray-600 border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-purple-500 rounded-full shadow-sm border border-purple-400"></div> ยอดขายหน้าร้าน</div>
                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-blue-500 rounded-full shadow-sm border border-blue-400"></div> ยอดขายออนไลน์</div>
              </div>
          </div>
      </div>
  </div>
  )
};

export const AllMenusModalContent = ({ groupedMenus }) => (
  <div className="animate-in fade-in p-2 md:p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
      <div className="space-y-10">
          {Object.entries(groupedMenus).map(([category, items], idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-3 h-8 bg-orange-500 rounded-full shadow-sm shadow-orange-200"></div> {category} 
                  <span className="text-[12px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">{items.length} รายการ</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {items.map(menu => {
                      const isAvailable = menu.isAvailable === true || menu.is_available === true;
                      return (
                          <div key={menu.id} className={`border border-gray-100 rounded-[20px] overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 ${!isAvailable ? 'opacity-60 grayscale-[50%]' : ''}`}>
                              <div className="h-28 bg-gray-50 relative overflow-hidden">
                                  {menu.image ? <img src={`${API_URL}/uploads/${menu.image}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"/> : <Utensils className="w-full h-full p-8 text-gray-300"/>}
                                  {!isAvailable && (
                                    <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center backdrop-blur-[1px]"><span className="bg-white text-gray-900 px-3 py-1 rounded-full text-[11px] font-black tracking-widest shadow-sm">ปิดการขาย</span></div>
                                  )}
                              </div>
                              <div className="p-4 flex flex-col justify-between h-[80px]">
                                  <p className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-snug">{menu.title}</p>
                                  <span className="font-black text-[#ea580c] text-[15px] mt-1">฿{menu.price}</span>
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

export const QueueModalContent = ({ activeOrders }) => (
  <div className="animate-in fade-in p-2 md:p-4 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
      {activeOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><ChefHat size={60} className="mx-auto mb-4 opacity-20"/><p className="text-lg font-bold">ไม่มีคิวออเดอร์ที่กำลังปรุงในขณะนี้</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeOrders.map(order => (
            <div key={order.ordersId || order.id} className="bg-white border border-gray-100 p-5 rounded-[24px] shadow-sm flex flex-col hover:border-emerald-300 transition-colors">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-lg">#{order.ordersId || order.id}</div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-800 line-clamp-1">{(!order.user || order.orderType === 'walkin') ? (order.customerInfo || 'หน้าร้าน') : `${order.user?.firstname} ${order.user?.lastname || ''}`}</p>
                      <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1"><Clock size={10}/> {new Date(order.createdAt || order.orderDate).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status?.toLowerCase()} />
               </div>
               <div className="mt-auto border-t border-dashed border-gray-100 pt-3 flex justify-between items-center">
                 <span className="text-[12px] font-bold text-gray-500">{order.items?.length || 0} รายการ</span>
                 <span className="font-black text-orange-500">฿{order.totalPrice || order.totalAmount}</span>
               </div>
            </div>
          ))}
        </div>
      )}
  </div>
);

export const CustomersModalContent = ({ details }) => (
  <div className="space-y-6 animate-in fade-in p-2 md:p-4">
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 p-6 rounded-[28px] flex flex-col justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 bg-blue-50 w-24 h-24 rounded-full opacity-50"></div>
              <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-4 relative z-10"><MonitorSmartphone size={22}/></div>
              <h4 className="text-3xl font-black text-gray-900 relative z-10">{details.onlineOrders}</h4>
              <p className="text-[12px] font-bold text-gray-500 mt-1 relative z-10">ออเดอร์ออนไลน์ (วันนี้)</p>
          </div>
          <div className="bg-white border border-gray-100 p-6 rounded-[28px] flex flex-col justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 bg-purple-50 w-24 h-24 rounded-full opacity-50"></div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 relative z-10"><Store size={22}/></div>
              <h4 className="text-3xl font-black text-gray-900 relative z-10">{details.walkinOrders}</h4>
              <p className="text-[12px] font-bold text-gray-500 mt-1 relative z-10">ลูกค้าหน้าร้าน (วันนี้)</p>
          </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-[28px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h4 className="font-black text-gray-900 text-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><UserPlus size={20}/></div>
                ลูกค้าที่สมัครใหม่ (ล่าสุด)
              </h4>
              <span className="text-[13px] font-bold bg-gray-100 text-gray-600 px-4 py-2 rounded-full border border-gray-200">สมาชิกรวมในระบบ {details.registered} คน</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left">
                  <thead>
                      <tr className="bg-gray-50 text-[12px] text-gray-500 uppercase tracking-wider">
                          <th className="p-4 font-bold border-b border-gray-100">ชื่อ-นามสกุล</th>
                          <th className="p-4 font-bold border-b border-gray-100">อีเมล</th>
                          <th className="p-4 font-bold border-b border-gray-100">เบอร์โทร</th>
                          <th className="p-4 font-bold border-b border-gray-100">วันที่สมัคร</th>
                      </tr>
                  </thead>
                  <tbody className="text-[14px] divide-y divide-gray-50">
                      {details.newUsers.length === 0 ? <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-bold">ยังไม่มีลูกค้าใหม่</td></tr> : 
                      details.newUsers.map((u, idx) => (
                          <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                              <td className="p-4 font-bold text-gray-900 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center text-[11px] font-black border border-white shadow-sm">
                                  {u.firstname ? u.firstname.charAt(0).toUpperCase() : <User size={14}/>}
                                </div> {u.firstname} {u.lastname}
                              </td>
                              <td className="p-4 text-gray-600 font-medium">{u.email}</td>
                              <td className="p-4 text-gray-600 font-medium">{u.tel || '-'}</td>
                              <td className="p-4 text-gray-400 text-[13px] font-bold">{new Date(u.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  </div>
);