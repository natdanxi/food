import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Save, Loader2, Mail } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../api';
import Navbar from '../../components/Navbar';
import Swal from 'sweetalert2';

const Profile = () => {
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', tel: '', address: '', email: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const token = localStorage.getItem('token');

  // ✅ โหลดข้อมูลจาก Database ทันทีที่เข้าหน้า
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/profile`, {
         headers: { Authorization: `Bearer ${token}` }
      });
        if (res.data) {
           setFormData({
             firstname: res.data.firstname || '',
             lastname: res.data.lastname || '',
             tel: res.data.tel || '',
             address: res.data.address || '',
             email: res.data.email || '' 
           });
           localStorage.setItem('user', JSON.stringify(res.data)); 
           window.dispatchEvent(new Event('auth-update')); 
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    if (token) fetchUserData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
  });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-update')); 
      
      // 🟢 ใช้ Swal เมื่อบันทึกสำเร็จ
      Swal.fire({ title: 'สำเร็จ!', text: 'บันทึกข้อมูลสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      // 🟢 ใช้ Swal เมื่อเกิดข้อผิดพลาด
      Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={40}/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center border border-orange-200 shadow-sm">
                <User size={32}/>
            </div>
            <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">ข้อมูลส่วนตัว</h2>
                <p className="text-gray-500 text-sm">จัดการชื่อ เบอร์โทร และที่อยู่จัดส่งของคุณ</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <Mail className="text-gray-400" size={20}/>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">บัญชีผู้ใช้</p>
                    <p className="text-gray-600 font-bold">{formData.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">ชื่อจริง</label>
                    <input name="firstname" value={formData.firstname} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-medium" placeholder="ระบุชื่อ" />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">นามสกุล</label>
                    <input name="lastname" value={formData.lastname} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-medium" placeholder="ระบุนามสกุล" />
                </div>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <Phone size={16} className="text-orange-500"/> เบอร์โทรศัพท์
                </label>
                <input name="tel" value={formData.tel} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-medium" placeholder="08x-xxx-xxxx" />
            </div>

            <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <MapPin size={16} className="text-orange-500"/> ที่อยู่จัดส่ง
                </label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none font-medium" placeholder="กรุณากรอกที่อยู่" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-100 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex justify-center items-center gap-3 mt-4">
                {loading ? <Loader2 className="animate-spin"/> : <><Save size={20}/> บันทึกข้อมูล</>}
            </button>
        </form>
      </div>
    </div>
  );
};
export default Profile;