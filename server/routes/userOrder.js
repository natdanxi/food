const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =======================
// Upload Slip Config
// =======================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// =======================
// 1. Create Order (สร้างคำสั่งซื้อ)
// =======================
router.post('/order', auth, upload.single('slip'), async (req, res) => {
    try {
        const { totalPrice, totalAmount, paymentMethod, note, items, orderType } = req.body;
        const userId = req.user?.id || req.user?.user?.id;

        if (!userId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });

        let parsedItems = [];
        if (items) parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

        const slipImageFilename = req.file ? req.file.filename : null;
        const finalPrice = parseFloat(totalPrice || totalAmount || 0);

        // 🟢 บันทึกลงตาราง Order ให้ตรงกับ Schema 100%
        const order = await prisma.order.create({
            data: {
                userId: Number(userId),
                orderType: orderType || 'online',
                status: 'pending',
                paymentMethod: paymentMethod || 'cash',
                totalPrice: finalPrice, 
                note: note || '',
                items: {
                    create: parsedItems.map(item => ({
                        productId: Number(item.id || item.product_id),
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.price), // 🟢 ต้องเป็น unitPrice
                        note: item.note || ''
                    }))
                }
            },
            include: { items: true }
        });

        // 🟢 ถ้าจ่ายแบบโอน ให้บันทึกสลิปลงตาราง Payment แยกต่างหาก
        if (paymentMethod === 'transfer' && slipImageFilename) {
            await prisma.payment.create({
                data: {
                    ordersId: order.ordersId,
                    paymentMethod: 'transfer',
                    amount: finalPrice,
                    slipImage: slipImageFilename,
                    paymentStatus: 'pending'
                }
            });
        }

        res.json({ message: 'สั่งซื้อสำเร็จ', order });
    } catch (err) {
        console.error('Create Order Error:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างออเดอร์', error: err.message });
    }
});

// =======================
// 2. Get User History (ดึงประวัติ)
// =======================
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.user?.id;
        const orders = await prisma.order.findMany({
            where: { userId: Number(userId) },
            include: { items: { include: { product: true } } },
            orderBy: { orderDate: 'desc' } // 🟢 Schema ของคุณชื่อ orderDate
        });
        res.json(orders);
    } catch (err) {
        console.error('History Error:', err);
        res.status(500).json({ message: 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ', error: err.message });
    }
});

// =======================
// 3. Cancel Order (ลูกค้ายกเลิกเอง)
// =======================
router.put('/cancel-order', auth, async (req, res) => {
    try {
        const { id, rejectReason } = req.body;
        const userId = req.user?.id || req.user?.user?.id;

        const order = await prisma.order.findFirst({
            where: { ordersId: Number(id), userId: Number(userId) } // 🟢 Primary Key คือ ordersId
        });

        if (!order) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'ไม่สามารถยกเลิกได้ เนื่องจากร้านเริ่มทำอาหารแล้ว' });

        const updatedOrder = await prisma.order.update({
            where: { ordersId: Number(id) },
            data: { status: 'cancelled', rejectReason: rejectReason || 'ลูกค้ายกเลิกคำสั่งซื้อ' }
        });

        res.json({ message: 'ยกเลิกคำสั่งซื้อสำเร็จ', order: updatedOrder });
    } catch (err) {
        console.error('Cancel Order Error:', err);
        res.status(500).json({ message: 'ไม่สามารถยกเลิกคำสั่งซื้อได้', error: err.message });
    }
});

module.exports = router;