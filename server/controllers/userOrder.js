const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🟢 ตั้งค่าที่เก็บไฟล์สลิปโอนเงิน (เฉพาะออเดอร์ออนไลน์)
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

const upload = multer({ storage }).single('slip');

/**
 * 🟢 สร้างคำสั่งซื้อใหม่ (รองรับทั้งตะกร้าลูกค้าออนไลน์ และ POS หน้าร้าน)
 */
exports.createOrder = async (req, res) => {
    // 🟢 ด่านตรวจที่ 1: เช็คว่าเป็นออเดอร์หน้าร้าน (POS) หรือไม่
    // ถ้าใช่ ให้ข้ามระบบเช็คไฟล์สลิปไปทำงานส่วนหน้าร้านทันที
    if (req.body && req.body.orderType === 'walkin') {
        return processWalkinOrder(req, res);
    }

    // 🟢 ด่านตรวจที่ 2: สำหรับออเดอร์ออนไลน์ ให้รันระบบเช็คอัปโหลดไฟล์สลิปตามปกติ
    upload(req, res, async (err) => {
        if (err) {
            if (req.body && req.body.paymentMethod === 'cash') {
                // ปล่อยผ่านกรณีเงินสดออนไลน์
            } else {
                console.error("Multer Error:", err); 
                return res.status(400).json({ message: "อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
            }
        }

        try {
            const { items, totalPrice, paymentMethod, orderType, note } = req.body;
            
            if (!items) return res.status(400).json({ message: "ไม่พบรายการอาหาร" });

            if (paymentMethod === 'transfer' && !req.file) {
                return res.status(400).json({ message: "กรุณาแนบสลิปโอนเงิน" });
            }

            const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
            const userId = req.user?.id || req.user?.user?.id; 
            if (!userId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ" });

            const orderData = {
                userId: Number(userId),
                orderType: orderType || 'online',
                paymentMethod: paymentMethod || 'transfer',
                status: 'pending',
                totalPrice: parseFloat(totalPrice || 0),
                note: note || ''
            };

            const newOrder = await prisma.order.create({
                data: {
                    ...orderData,
                    items: {
                        create: parsedItems.map(item => ({
                            productId: parseInt(item.product_id || item.id),
                            quantity: parseInt(item.quantity),
                            unitPrice: parseFloat(item.price),
                            note: item.note || ''
                        }))
                    }
                }
            });

            if (paymentMethod === 'transfer' && req.file) {
                await prisma.payment.create({
                    data: {
                        ordersId: newOrder.ordersId,
                        paymentMethod: 'transfer',
                        amount: parseFloat(totalPrice || 0),
                        slipImage: req.file.filename,
                        paymentStatus: 'pending'
                    }
                });
            }

            res.status(201).json({ message: "สั่งซื้อสำเร็จ", orderId: newOrder.ordersId });

        } catch (error) {
            console.error("Create Online Order Error:", error);
            res.status(500).json({ message: "สั่งซื้อไม่สำเร็จ: " + error.message });
        }
    });
};

/**
 * 🟢 ฟังก์ชันประมวลผลออเดอร์หน้าร้าน (POS) แบบไม่มีไฟล์สลิปเข้ามารบกวน
 */
const processWalkinOrder = async (req, res) => {
    try {
        const { items, totalPrice, paymentMethod, customerInfo } = req.body;
        
        if (!items || items.length === 0) return res.status(400).json({ message: "ไม่พบรายการอาหาร" });

        const userId = req.user?.id || req.user?.user?.id; 
        if (!userId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });

        // บันทึก Order
        const newOrder = await prisma.order.create({
            data: {
                userId: Number(userId),
                orderType: 'walkin',
                paymentMethod: paymentMethod || 'cash',
                status: 'completed', // หน้าร้านถือว่าเสร็จสิ้นและรับเงินแล้วทันที
                totalPrice: parseFloat(totalPrice || 0),
                note: `[ลูกค้า/โต๊ะ: ${customerInfo || 'ลูกค้าหน้าร้านทั่วไป'}]`,
                items: {
                    create: items.map(item => ({
                        productId: parseInt(item.product_id || item.id),
                        quantity: parseInt(item.quantity),
                        unitPrice: parseFloat(item.price),
                        note: item.note || ''
                    }))
                }
            }
        });

        // บันทึก Payment
        await prisma.payment.create({
            data: {
                ordersId: newOrder.ordersId,
                paymentMethod: paymentMethod || 'cash',
                amount: parseFloat(totalPrice || 0),
                paymentStatus: 'completed'
            }
        });

        res.status(201).json({ message: "บันทึกคำสั่งซื้อหน้าร้านสำเร็จ", orderId: newOrder.ordersId });
    } catch (error) {
        console.error("Walkin Order Error:", error);
        res.status(500).json({ message: "บันทึกข้อมูลหน้าร้านไม่สำเร็จ: " + error.message });
    }
};