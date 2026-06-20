const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        // สร้างโฟลเดอร์ uploads อัตโนมัติถ้ายังไม่มี
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ให้ตรงกับประเภทของรูปภาพ
        if (file.fieldname === 'qrCode') {
            cb(null, `shop-qrcode${path.extname(file.originalname)}`);
        } else if (file.fieldname === 'slip') {
            cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
        } else {
            cb(null, `shop-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
        }
    }
});

const upload = multer({ storage });
module.exports = upload;