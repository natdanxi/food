const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
    try {
        const { firstname, lastname, email, password, tel } = req.body;
        const userExists = await prisma.user.findFirst({ where: { email } });
        if (userExists) return res.status(400).json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.create({
            data: { firstname, lastname, email, password: hashedPassword, tel, role: "user" }
        });
        res.json({ message: "สมัครสมาชิกสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }); 

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

        const payload = { user: { id: user.id, role: user.role, firstname: user.firstname } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
        delete user.password;
        res.json({ token, payload, user });
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

// 🟢 เพิ่มกลับมาให้แล้วครับ
exports.currentUser = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: Number(req.user.id) },
            select: { id: true, email: true, role: true, firstname: true, lastname: true }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 🟢 เพิ่มกลับมาให้แล้วครับ
exports.currentAdmin = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: Number(req.user.id) },
            select: { id: true, email: true, role: true, firstname: true, lastname: true }
        });
        if (user.role !== 'admin') return res.status(403).json({ message: "Admin Access Denied" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, firstname: true, lastname: true, email: true, role: true, tel: true, createdAt: true },
            orderBy: { id: 'desc' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: Number(id) } });
        res.json({ message: "ลบผู้ใช้งานสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "ลบไม่ได้: มีข้อมูลออเดอร์ค้างอยู่" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, firstname, lastname, tel } = req.body; 
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { role, firstname, lastname, tel }
        });
        delete updatedUser.password;
        res.json({ message: "อัปเดตข้อมูลสำเร็จ", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "อัปเดตไม่ได้: " + err.message });
    }
};