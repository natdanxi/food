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
                items: { include: { product: true } }
            },
            // 🟢 แก้จาก id เป็น ordersId
            orderBy: { ordersId: 'desc' } 
        });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. อัปเดตสถานะออเดอร์
router.put('/order-status', auth, async (req, res) => {
    try {
        const { id, status, rejectReason } = req.body;
        const updateData = { status: status };
        if (rejectReason) updateData.rejectReason = rejectReason;

        const updatedOrder = await prisma.order.update({
            // 🟢 แก้จาก id เป็น ordersId
            where: { ordersId: Number(id) },
            data: updateData
        });
        res.json(updatedOrder);
    } catch (err) {
        console.error("Update Status Error:", err);
        res.status(500).json({ message: "Update Status Error" });
    }
});

module.exports = router;