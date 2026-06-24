// จัดการเส้นทาง API ฝั่งแอดมิน สำหรับดึงและอัปเดตสถานะออเดอร์
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth } = require('../middleware/auth');

// 1. ดึงออเดอร์ทั้งหมด
router.get('/orders', auth, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { firstname: true, lastname: true, tel: true } },
                items: { include: { product: true } },
                payments: true
            },
            orderBy: { ordersId: 'desc' }
        });

        const formatted = orders.map(o => {
            const slip = Array.isArray(o.payments) && o.payments.length
                ? (o.payments[0].slipImage || o.payments[0].slip_image)
                : null;
            return { ...o, slipImage: slip };
        });

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. อัปเดตสถานะออเดอร์
router.put('/order-status', auth, async (req, res) => {
    try {
        const { id, status, rejectReason } = req.body;
        const updateData = { status };
        if (rejectReason) updateData.rejectReason = rejectReason;

        const updatedOrder = await prisma.order.update({
            where: { ordersId: Number(id) },
            data: updateData
        });
        res.json(updatedOrder);
    } catch (err) {
        console.error("Update Status Error:", err);
        res.status(500).json({ message: "Update Status Error" });
    }
});

// 3. ✅ สร้างออเดอร์หน้าร้าน Walk-in (Admin POS) — เพิ่มใหม่
router.post('/order-walkin', auth, async (req, res) => {
    try {
        const { items, totalPrice, paymentMethod, orderType, customerInfo } = req.body;

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "ไม่พบรายการอาหาร (items)" });
        }
        if (!paymentMethod) {
            return res.status(400).json({ message: "กรุณาระบุช่องทางชำระเงิน" });
        }

        // สร้าง Order + Items พร้อมกัน
        const newOrder = await prisma.order.create({
            data: {
                orderType: orderType || 'walkin',
                paymentMethod: paymentMethod,
                status: 'pending',
                totalPrice: parseFloat(totalPrice || 0),
                customerInfo: customerInfo || 'ลูกค้าหน้าร้าน',
                // walkin ไม่มี userId
                items: {
                    create: items.map(item => ({
                        productId: parseInt(item.productId),
                        quantity: parseInt(item.quantity),
                        unitPrice: parseFloat(item.price),
                        note: item.note || ''
                    }))
                }
            }
        });

        // ถ้าโอนเงิน สร้าง Payment record ไว้รอสลิปทีหลัง
        if (paymentMethod === 'transfer') {
            await prisma.payment.create({
                data: {
                    ordersId: newOrder.ordersId,
                    paymentMethod: 'transfer',
                    amount: parseFloat(totalPrice || 0),
                    paymentStatus: 'pending'
                }
            });
        }

        res.status(201).json({ message: "บันทึกออเดอร์หน้าร้านสำเร็จ", orderId: newOrder.ordersId });

    } catch (err) {
        console.error("Create Walkin Order Error:", err);
        res.status(500).json({ message: "บันทึกไม่สำเร็จ: " + err.message });
    }
});

module.exports = router;