import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

export function useFetchData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // ดึง token เพื่อส่งไปยืนยันตัวตนด้วย
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.get(`${API_URL}${endpoint}`, { headers });
      setData(res.data);
    } catch (err) {
      console.error("Fetch Data Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ส่งข้อมูล, สถานะโหลด, และฟังก์ชันโหลดข้อมูลซ้ำ ออกไปให้หน้าเว็บใช้
  return { data, loading, refetch: fetchData };
}