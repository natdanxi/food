// จัดการเส้นทาง API สำหรับหมวดหมู่สินค้า
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const { auth } = require('../middleware/auth'); 

// 🟢 เปลี่ยนจาก '/' เป็น '/category' ทั้งหมด ป้องกันการทับซ้อน (Conflict) กับ API ตัวอื่น
router.get('/category', categoryController.getCategories);
router.post('/category', auth, categoryController.createCategory);
router.put('/category/:id', auth, categoryController.updateCategory);
router.delete('/category/:id', auth, categoryController.deleteCategory);

module.exports = router;