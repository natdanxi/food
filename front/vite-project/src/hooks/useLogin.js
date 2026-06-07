import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api'; // นำเข้า API_URL ให้ตรงกับระบบที่เหลือ

export const useLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // ล้างแจ้งเตือน Error ทันทีเมื่อผู้ใช้เริ่มพิมพ์แก้
    if (error) setError('');
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ดักไว้ก่อนดึง API ป้องกันการส่งค่าว่าง
    if (!formData.email || !formData.password) {
        setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. ใช้ axios เหมือนกับไฟล์อื่นๆ ในโปรเจกต์
      const response = await axios.post(`${API_URL}/api/login`, formData);
      const data = response.data;

      // 2. ดึงข้อมูลให้สอดคล้องกับที่ Backend (auth.js) ส่งมาให้
      const token = data.token;
      // Backend ส่งค่ามาในรูปแบบ data.payload.user
      const role = data.role || data.user?.role || data.payload?.user?.role || 'user'; 
      const name = data.firstname || data.user?.firstname || data.payload?.user?.firstname || 'ลูกค้า';

      // 3. บันทึกข้อมูลลง Local Storage
      localStorage.setItem('token', token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', name);

      setUserName(name);
      setIsSuccess(true); 

    } catch (err) {
      console.error('Login Error:', err);
      
      // 4. แยกแยะ Error ให้ชัดเจนขึ้น
      if (err.response) {
        // กรณี Server ตอบกลับมาว่ารหัสผิด หรือ ไม่พบผู้ใช้
        setError(err.response.data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        // กรณีเซิร์ฟเวอร์ปิดอยู่ หรือเน็ตหลุด
        setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองอีกครั้ง');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    isLoading,
    error,
    isSuccess,
    userName,
    handleChange,
    togglePassword,
    handleSubmit
  };
};