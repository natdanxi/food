const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        // 1. ค้นหา Token จาก Header
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.headers.authtoken) {
            token = req.headers.authtoken;
        }

        // 2. ถ้าไม่มี Token ส่งมาเลย
        if (!token) {
            return res.status(401).json({ message: "ไม่มี Token กรุณาล็อคอินใหม่" });
        }

        // 3. ใช้กุญแจลับจากไฟล์ .env (ต้องตรงกับตอนที่สร้าง Token ใน controller/auth.js)
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            console.error("Critical Error: ไม่พบ JWT_SECRET ในไฟล์ .env");
            return res.status(500).json({ message: "Server Configuration Error" });
        }
        
        // 4. ถอดรหัส Token
        const decoded = jwt.verify(token, secret);
        
        // 5. แนบข้อมูล User (จาก Payload) ไปกับ Request เพื่อให้ Controller นำไปใช้ต่อ
        req.user = decoded.user;
        
        // ผ่านด่าน! ให้ไปทำฟังก์ชันถัดไป (Controller)
        next(); 

    } catch (err) {
        console.error("Auth Error (จับได้แล้ว! เซิร์ฟเวอร์ไม่พัง):", err.message);
        return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
    }
};