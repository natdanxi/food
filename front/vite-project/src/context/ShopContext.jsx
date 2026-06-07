import React, { createContext, useState, useEffect, useContext } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [shopInfo, setShopInfo] = useState({
    name: 'แม่ครัวตัวกลม',
    logo: null             
  });

  // โหลดข้อมูลจาก LocalStorage 
  useEffect(() => {
    const savedName = localStorage.getItem('shopName');
    const savedLogo = localStorage.getItem('shopLogo');
    
    if (savedName) {
      setShopInfo(prev => ({ ...prev, name: savedName }));
    }
    if (savedLogo) {
      setShopInfo(prev => ({ ...prev, logo: savedLogo }));
    }
  }, []);

  // ฟังก์ชันอัปเดตข้อมูล (เรียกใช้จากหน้าตั้งค่า)
  const updateShopInfo = (name, logoFile) => {
    // 1. บันทึกชื่อ
    localStorage.setItem('shopName', name);
    
    // 2. บันทึกรูป (แปลงไฟล์เป็น Base64 เพื่อเก็บใน LocalStorage แบบง่ายๆ)
    // *หมายเหตุ: ในระบบจริงควรส่งไฟล์ไปเก็บที่ Server แล้วเซฟเป็น URL
    if (logoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        localStorage.setItem('shopLogo', base64String);
        setShopInfo({ name, logo: base64String });
      };
      reader.readAsDataURL(logoFile);
    } else {
      setShopInfo(prev => ({ ...prev, name }));
    }
  };

  return (
    <ShopContext.Provider value={{ shopInfo, updateShopInfo }}>
      {children}
    </ShopContext.Provider>
  );
};

// Hook เรียกใช้ข้อมูลร้าน
export const useShop = () => useContext(ShopContext);