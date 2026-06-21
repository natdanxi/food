import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { API_URL } from '../../api'; // ✅ ดึงลิ้งค์จากไฟล์กลาง

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    tel: '',
    address: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ แก้จุดผิด 1: ใช้ API_URL และ path /register
      // ✅ แก้จุดผิด 2: ส่งตัวแปร formData (ไม่ใช่ form)
      await axios.post(`${API_URL}/api/register`, formData);
      
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ ');
      navigate('/login'); 
    } catch (err) {
      console.error(err);
      alert('สมัครไม่สำเร็จ: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 font-sans py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg mx-4">
        
        <div className="text-center mb-8">
          <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ChefHat size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">สร้างบัญชีใหม่</h2>
          <p className="text-gray-500 text-sm">กรอกข้อมูลเพื่อสมัครสมาชิกแม่ครัวตัวกลม</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input type="text" name="firstname" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm" placeholder="ชื่อจริง" onChange={handleChange} />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input type="text" name="lastname" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm" placeholder="นามสกุล" onChange={handleChange} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={18} className="text-gray-400" />
            </div>
            <input type="text" name="tel" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm" placeholder="เบอร์โทรศัพท์" onChange={handleChange} />
          </div>

          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <MapPin size={18} className="text-gray-400" />
            </div>
            <textarea name="address" rows="2" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm resize-none" placeholder="ที่อยู่จัดส่ง (ถ้ามี)" onChange={handleChange} ></textarea>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input type="email" name="email" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm" placeholder="อีเมล" onChange={handleChange} />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input type={showPassword ? "text" : "password"} name="password" required className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm" placeholder="รหัสผ่าน" onChange={handleChange} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-orange-500 cursor-pointer">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-md transform transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 mt-2">
            {loading ? 'กำลังบันทึก...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-orange-600 font-bold hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;