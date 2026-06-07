const express = require('express');
const router = express.Router();

// นำเข้า Middleware รปภ.
const { auth } = require('../middleware/auth'); 

// นำเข้า Controller ของร้านค้าทั้งหมด
const { 
    getShopInfo, 
    updateShopInfo, 
    checkShopStatus 
} = require('../controllers/shop');

// ==========================================
// กำหนดเส้นทาง API (Routes)
// ==========================================

// สำหรับดึงข้อมูลและตั้งค่าร้านค้า (ใช้ในหน้า Admin Settings)
router.get('/shop', getShopInfo);
router.put('/shop', auth, updateShopInfo); 

// 🟢 เส้นทางนี้คือตัวที่ช่วยแก้ Error 404 ให้ Navbar!
router.get('/shop/status', checkShopStatus); 

module.exports = router;