const express = require('express');
const router = express.Router();

// ดึงฟังก์ชันมาจาก controllers ให้ครบถ้วน
const { register, login, currentUser, currentAdmin, listUsers, removeUser, updateUser } = require('../controllers/auth');

// ดึงอีกหนึ่ง Middleware สำหรับตรวจสอบแอดมิน
const { auth } = require('../middleware/auth');

// กำหนดเส้นทาง API
router.post('/register', register); 
router.post('/login', login);
router.post('/current-user', currentUser);
router.post('/current-admin', currentAdmin); // เผื่อมีการใช้เช็คสิทธิ์แอดมิน

// 🟢 เพิ่ม auth middleware เพื่อป้องกัน Unauthorized Access
router.get('/users', auth, listUsers);
router.delete('/users/:id', auth, removeUser);
router.put('/users/:id', auth, updateUser);

module.exports = router;