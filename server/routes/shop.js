// จัดการเส้นทาง API สำหรับข้อมูลและสถานะของร้านค้า
const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth'); 
const upload = require('../middleware/upload'); 

const { 
    getShopInfo, 
    updateShop, // ✨ แก้จาก updateShopInfo เป็น updateShop ให้ตรงกัน
    checkShopStatus 
} = require('../controllers/shop');

router.get('/shop', getShopInfo);
router.get('/shop/status', checkShopStatus); 

// ✨ แก้ไขฟังก์ชันปลายทางตรงนี้เป็น updateShop ด้วยครับ
router.put('/shop', auth, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'qrCode', maxCount: 1 }
]), updateShop); 

module.exports = router;