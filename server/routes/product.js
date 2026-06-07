const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { auth } = require('../middleware/auth');
const multer = require('multer');

// ตั้งค่าที่เก็บไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `product-${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// 🟢 แก้ไข: ใส่ callback function (Controller) ให้ถูกต้อง
router.get('/product', productController.getProducts);

// 🟢 แก้ไข: เพิ่ม upload.single('image') เพื่อดึงข้อมูลจาก FormData
router.post('/product', auth, upload.single('image'), productController.createProduct);
router.put('/product/:id', auth, upload.single('image'), productController.updateProduct);
router.delete('/product/:id', auth, productController.deleteProduct);

module.exports = router;