const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🟢 ให้ระบบหาชื่อ Model อัตโนมัติ (รองรับ User หรือ users)
const UserModel = prisma.user || prisma.users;

// ==========================================
// 1. สมัครสมาชิก (Register)
// ==========================================
exports.register = async (req, res) => {
    try {
        if (!UserModel) throw new Error("หาตาราง User ไม่เจอ");
        const { firstname, lastname, email, password, tel } = req.body;
        const userExists = await UserModel.findFirst({ where: { email } });
        if (userExists) return res.status(400).json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await UserModel.create({
            data: { firstname, lastname, email, password: hashedPassword, tel, role: "user" }
        });
        res.json({ message: "สมัครสมาชิกสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

// ==========================================
// 2. เข้าสู่ระบบ (Login)
// ==========================================
exports.login = async (req, res) => {
    try {
        if (!UserModel) throw new Error("หาตาราง User ไม่เจอ");
        const { email, password } = req.body;
        
        const user = await UserModel.findFirst({ where: { email } });
        if (!user) return res.status(400).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" });

        // ตรวจสอบรหัสผ่านแบบ "ยืดหยุ่น" รองรับทั้งรหัสเข้ารหัส และรหัสข้อความธรรมดา
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (compareErr) {
            console.log("Bcrypt compare failed, checking plain text...");
        }
        
        if (!isMatch && password !== user.password) {
            return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
        }

        const payload = {
            user: { id: user.id, email: user.email, role: user.role, firstname: user.firstname, lastname: user.lastname }
        };

        // 🎯 ล็อครหัสลับตายตัว ป้องกัน Error (ต้องตรงกับไฟล์ middleware)
        const secret = 'MySecretKey1234'; 
        
        const token = jwt.sign(payload, secret, { expiresIn: "1d" });
        res.json({ token, payload });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

// ==========================================
// 3. ตรวจสอบผู้ใช้ปัจจุบัน
// ==========================================
exports.currentUser = async (req, res) => {
    try {
        const userId = req.body?.id || req.user?.id;
        const user = await UserModel.findFirst({
            where: { id: userId },
            select: { id: true, firstname: true, lastname: true, email: true, role: true, tel: true, address: true }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 4. ตรวจสอบสถานะแอดมิน
// ==========================================
exports.currentAdmin = async (req, res) => {
    try {
        const userId = req.body?.id || req.user?.id;
        const user = await UserModel.findFirst({
            where: { id: userId },
            select: { id: true, firstname: true, lastname: true, email: true, role: true }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 5. ดึงรายชื่อผู้ใช้ทั้งหมด
// ==========================================
exports.listUsers = async (req, res) => {
    try {
        const users = await UserModel.findMany({
            select: { id: true, firstname: true, lastname: true, email: true, role: true, tel: true, address: true, createdAt: true },
            orderBy: { id: 'desc' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 6. ลบผู้ใช้งาน
// ==========================================
exports.removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        await UserModel.delete({ where: { id: Number(id) } });
        res.json({ message: "ลบผู้ใช้งานสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "ลบไม่ได้: มีข้อมูลออเดอร์ค้างอยู่" });
    }
};

// ==========================================
// 7. อัปเดตข้อมูลผู้ใช้งาน
// ==========================================
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, firstname, lastname, tel, address } = req.body; 
        const updatedUser = await UserModel.update({
            where: { id: Number(id) },
            data: { role, firstname, lastname, tel, address }
        });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};