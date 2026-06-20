import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../api'; 

export function useAdminOrders() {
  const token = localStorage.getItem('token');
  const prevPendingCount = useRef(0);

  // --- States ทั้งหมด ---
  const [appMode, setAppMode] = useState('pos'); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); 
  const [isOpen, setIsOpen] = useState(true);
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all'); 
  const [cart, setCart] = useState([]);
  const [tableInfo, setTableInfo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- API Functions ---
  const fetchOrders = async () => {
    try { 
      const res = await axios.get(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }); 
      setOrders(res.data); 
      const currentPendingCount = res.data.filter(o => o.status === 'pending').length;
      if (currentPendingCount > prevPendingCount.current && prevPendingCount.current !== 0) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'มีออเดอร์ใหม่เข้ามา!', showConfirmButton: false, timer: 3000 });
      }
      prevPendingCount.current = currentPendingCount;
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const toggleShopOpen = async () => {
    setIsTogglingOpen(true);
    try {
      const res = await axios.get(`${API_URL}/api/shop`);
      await axios.put(`${API_URL}/api/shop`, { isOpen: !isOpen, name: res.data.shopName }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      setIsOpen(!isOpen);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: !isOpen ? 'ร้านเปิดรับออเดอร์แล้ว' : 'ปิดร้านชั่วคราวแล้ว', showConfirmButton: false, timer: 2000 });
    } catch (err) { Swal.fire('เกิดข้อผิดพลาด', 'อัปเดตสถานะร้านไม่ได้', 'error'); } 
    finally { setIsTogglingOpen(false); }
  };

  const handleStatusChange = async (orderId, nextStatus) => {
    try { 
        await axios.put(`${API_URL}/api/order-status`, { id: orderId, status: nextStatus }, { headers: { Authorization: `Bearer ${token}` } }); 
        fetchOrders(); 
    } catch (err) { Swal.fire('เกิดข้อผิดพลาด', 'อัปเดตสถานะไม่ได้', 'error'); }
  };

  const handleWalkinCheckout = async (paymentMethod) => {
    if (cart.length === 0) return;
    try {
      await axios.post(`${API_URL}/api/order-walkin`, { cart, cartTotal, orderType: 'walkin', paymentMethod, customerInfo: tableInfo || 'ลูกค้าหน้าร้าน' }, { headers: { Authorization: `Bearer ${token}` } });
      setCart([]); setTableInfo(''); fetchOrders(); 
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกยอดขายเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) { Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error'); }
  };

  // ดึงข้อมูลเริ่มต้นตอนเปิดหน้าเว็บ
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [prodRes, catRes, statusRes] = await Promise.all([
          axios.get(`${API_URL}/api/product`),
          axios.get(`${API_URL}/api/category`),
          axios.get(`${API_URL}/api/shop/status`)
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setIsOpen(statusRes.data.isOpenNow);
      } catch (err) { console.error(err); }
    };
    fetchInitialData();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); 
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  const updateQty = (cartId, delta) => { 
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0)); 
  };
  
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.qty), 0), [cart]);

  return {
    appMode, setAppMode, orders, loading, activeTab, setActiveTab, isOpen, isTogglingOpen,
    products, categories, activeCategory, setActiveCategory, cart, setCart, tableInfo, setTableInfo,
    searchTerm, setSearchTerm, currentTime, updateQty, cartTotal, toggleShopOpen, handleStatusChange, 
    handleWalkinCheckout, fetchOrders
  };
}