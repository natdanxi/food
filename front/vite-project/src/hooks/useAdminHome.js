import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

// --- ฟังก์ชันคำนวณสถิติและกราฟ  ---
const processDashboardData = (orders, products, users) => {
  const today = new Date();

  const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  const completedOrders = orders.filter(o => o.status?.toLowerCase() === 'completed');
  const todayOrders = orders.filter(o => isSameDay(o.createdAt || o.orderDate, today));
  const pending = todayOrders.filter(o => o.status?.toLowerCase() === 'pending');
  const cooking = todayOrders.filter(o => o.status?.toLowerCase() === 'cooking');
  const completedToday = todayOrders.filter(o => o.status?.toLowerCase() === 'completed');

  const todaySales = completedToday.reduce((sum, o) => sum + Number(o.totalPrice || o.totalAmount || 0), 0);

  const dailyData = [
    { label: '08:00', walkin: 0, online: 0 }, { label: '12:00', walkin: 0, online: 0 },
    { label: '16:00', walkin: 0, online: 0 }, { label: '20:00', walkin: 0, online: 0 },
  ];

  completedToday.forEach((o) => {
    const hour = new Date(o.createdAt || o.orderDate).getHours();
    let index = 0;
    if (hour >= 10 && hour < 14) index = 1;
    else if (hour >= 14 && hour < 18) index = 2;
    else if (hour >= 18) index = 3;

    const amount = Number(o.totalPrice || o.totalAmount || 0);
    if (o.orderType === 'walkin') dailyData[index].walkin += amount;
    else dailyData[index].online += amount;
  });

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(today.getDate() - 6 + i);
    const dayOrders = completedOrders.filter(o => isSameDay(o.createdAt || o.orderDate, d));
    return {
      label: d.toLocaleDateString('th-TH', { weekday: 'short' }),
      walkin: dayOrders.filter(o => o.orderType === 'walkin').reduce((sum, o) => sum + Number(o.totalPrice || o.totalAmount || 0), 0),
      online: dayOrders.filter(o => o.orderType !== 'walkin').reduce((sum, o) => sum + Number(o.totalPrice || o.totalAmount || 0), 0),
    };
  });

  const monthlyData = Array.from({ length: 4 }, (_, i) => ({ label: `สัปดาห์ ${i + 1}`, walkin: 0, online: 0 }));

  completedOrders.filter(o => new Date(o.createdAt || o.orderDate).getMonth() === today.getMonth()).forEach((o) => {
      const date = new Date(o.createdAt || o.orderDate).getDate();
      let weekIdx = Math.floor((date - 1) / 7);
      if (weekIdx > 3) weekIdx = 3;
      const amount = Number(o.totalPrice || o.totalAmount || 0);
      if (o.orderType === 'walkin') monthlyData[weekIdx].walkin += amount;
      else monthlyData[weekIdx].online += amount;
    });

  const groupedMenus = products.reduce((acc, curr) => {
    const cat = curr.category?.categoryName || curr.category?.name || 'ไม่มีหมวดหมู่';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const regularUsers = users.filter(u => u.role === 'user');
  const newUsers = [...regularUsers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

  return {
    stats: {
      sales: todaySales, newOrdersCount: pending.length, cookingCount: cooking.length,
      completedCount: completedToday.length, totalMenus: products.length, totalCustomers: regularUsers.length,
      activeUsers: pending.length + cooking.length,
    },
    recentOrders: orders.slice(0, 6),
    activeOrdersList: [...pending, ...cooking].sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate)), 
    graphData: { daily: dailyData, weekly: weeklyData, monthly: monthlyData },
    groupedMenus,
    customerDetails: { onlineOrders: todayOrders.filter(o => o.orderType !== 'walkin').length, walkinOrders: todayOrders.filter(o => o.orderType === 'walkin').length, registered: regularUsers.length, newUsers: newUsers }
  };
};

export function useAdminHome() {
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: { sales: 0, newOrdersCount: 0, cookingCount: 0, completedCount: 0, totalMenus: 0, totalCustomers: 0, activeUsers: 0 },
    recentOrders: [], activeOrdersList: [], graphData: { daily: [], weekly: [], monthly: [] },
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

  return { loading, activeModal, setActiveModal, dashboardData };
}