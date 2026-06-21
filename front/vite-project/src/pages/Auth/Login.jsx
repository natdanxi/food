import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../api'; 
import { Mail, Lock, Eye, EyeOff, ChefHat, Check, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State สำหรับ Popup
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🟢 แก้ไขจุดนี้: เอาคำว่า /api ออกเนื่องจากค่าดั้งเดิมใน API_URL มีพ่วงมาให้อยู่แล้ว
      const res = await axios.post(`${API_URL}/login`, form);
      localStorage.setItem('token', res.data.token);
      
      const user = res.data.payload.user;
      const role = user.role;

      setUserName(user.firstname);
      setShowSuccess(true); 

      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin'); 
        } else {
          navigate('/menu'); 
        }
      }, 2000);

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันสำหรับปุ่ม Guest (ไม่ต้องใช้รหัส)
  const handleGuestAccess = () => {
    // ไม่ต้องเช็คอะไรเลย พาไปหน้าเมนูทันที
    navigate('/menu');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4 font-sans relative">
      
      {/* Popup เมื่อ Login สำเร็จ */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center w-80 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500 shadow-sm">
                 <Check size={36} strokeWidth={4} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">เข้าสู่ระบบสำเร็จ!</h2>
              <p className="text-sm text-gray-500 mb-6">ยินดีต้อนรับคุณ <span className="text-orange-500 font-bold">{userName}</span> ครับ</p>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                 <Loader2 className="animate-spin" size={14}/> กำลังพาไปที่หน้าร้าน...
              </div>
           </div>
        </div>
      )}

      {/* --- กล่อง Login --- */}
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-200 mb-4">
            <ChefHat size={32} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">แม่ครัว<span className="text-orange-500">ตัวกลม</span></h1>
          <p className="text-gray-500 text-sm">ระบบสั่งอาหารออนไลน์</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={20} /></div>
             <input type="email" name="email" required className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-200 transition outline-none" placeholder="อีเมล" onChange={handleChange} />
          </div>

          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
             <input type={showPassword ? "text" : "password"} name="password" required className="w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-200 transition outline-none" placeholder="รหัสผ่าน" onChange={handleChange} />
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
               {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
             </button>
          </div>

          <button type="submit" disabled={loading || showSuccess} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* เส้นกั้น */}
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">หรือ</span></div>
        </div>

        {/* ✅ ปุ่ม Guest (เข้าถึงแบบไม่ใช้รหัส) */}
        <button 
          type="button"
          onClick={handleGuestAccess}
          className="w-full py-3 bg-white border-2 border-orange-100 text-orange-600 font-bold rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all flex items-center justify-center gap-2"
        >Guest </button>

        <div className="mt-6 text-center text-sm text-gray-500">
            ยังไม่มีบัญชี? <Link to="/register" className="text-orange-600 font-bold hover:underline">สมัครสมาชิกเลย</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;