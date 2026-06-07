const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.headers.authtoken) {
            token = req.headers.authtoken;
        }

        if (!token) {
            return res.status(401).json({ message: "ไม่มี Token กรุณาล็อคอินใหม่" });
        }

        const secret = 'MySecretKey1234'; // 🎯 รหัสนี้ต้องตรงกับตอน Login
        
        // ถ้ากุญแจเก่าหรือพัง บรรทัดนี้จะโยน Error เข้า catch ทันที (เซิร์ฟเวอร์จะไม่พัง)
        const decoded = jwt.verify(token, secret);
        req.user = decoded.user;
        
        next(); 
    } catch (err) {
        console.error("Auth Error (จับได้แล้ว! เซิร์ฟเวอร์ไม่พัง):", err.message);
        return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
    }
};