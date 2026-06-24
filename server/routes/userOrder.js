    const express = require('express');
    const router = express.Router();
    const { auth } = require('../middleware/auth');
    // ไม่ต้องใช้ upload ตรงนี้แล้ว ลบทิ้งหรือคอมเมนต์ไว้ได้เลย
    // const upload = require('../middleware/upload'); 

    const userOrderController = require('../controllers/userOrder');

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    //  ประวัติคำสั่งซื้อของผู้ใช้
    router.post('/order', auth, userOrderController.createOrder);

    // เส้นทางสําหรับการสั่งซื้อสินค้า
    router.post('/order-walkin', auth, userOrderController.createOrder);

    //  ประวัติคำสั่งซื้อของผู้ใช้
    router.get('/history', auth, async (req, res) => {
        try {
            const userId = req.user?.id || req.user?.user?.id;
            
            const orders = await prisma.order.findMany({
                where: { userId: Number(userId) },
                include: { 
                    items: { include: { product: true } },
                    payments: true 
                },
                orderBy: { ordersId: 'desc' }
            });

            const formattedOrders = orders.map(o => {
                const slip = Array.isArray(o.payments) && o.payments.length 
                    ? (o.payments[0].slipImage || o.payments[0].slip_image) 
                    : null;
                return { ...o, slipImage: slip };
            });

            res.json(formattedOrders);
        } catch (err) {
            console.error('History Error:', err);
            res.status(500).json({ message: 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ', error: err.message });
        }
    });

    router.put('/cancel-order', auth, async (req, res) => {
        try {
            const { id, rejectReason } = req.body;
            const userId = req.user?.id || req.user?.user?.id;

            const order = await prisma.order.findFirst({
                where: { ordersId: Number(id), userId: Number(userId) }
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