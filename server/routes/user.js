const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth'); 

// 1. นำเข้า Controller สำหรับ Profile (จากไฟล์ user.js)
const { getUserProfile, updateUserProfile } = require('../controllers/user');

// ==========================================
// 🟢 เส้นทางหน้า Profile (ดึงข้อมูลตัวเอง)
// ==========================================
router.get('/profile', auth, getUserProfile); 
router.put('/profile', auth, updateUserProfile);

module.exports = router;