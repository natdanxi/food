// จัดการเส้นทาง API สำหรับรายการเมนูอาหาร
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { auth } = require('../middleware/auth');

//  นำเข้าระบบจัดการไฟล์จาก Middleware
const upload = require('../middleware/upload');

//  ไม่ต้องมี auth เพราะให้ลูกค้าดูเมนูได้
router.get('/product', productController.getProducts);

//  ด่านตรวจ: ต้องเป็น Admin (auth) และรับไฟล์รูป (upload.single)
router.post('/product', auth, upload.single('image'), productController.createProduct);
router.put('/product/:id', auth, upload.single('image'), productController.updateProduct);
router.delete('/product/:id', auth, productController.deleteProduct);

module.exports = router;