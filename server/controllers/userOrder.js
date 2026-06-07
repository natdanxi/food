const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🟢 ตั้งค่าที่เก็บไฟล์สลิปโอนเงิน
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
 * 🟢 สร้างคำสั่งซื้อใหม่ (ฝั่งลูกค้า)
 */
exports.createOrder = async (req, res) => {
    // ใช้ upload middleware เพื่อรองรับการส่ง FormData (มีไฟล์รูป)
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ message: "อัปโหลดสลิปไม่สำเร็จ" });

        try {
            // 1. รับค่าจากหน้าบ้าน (FormData จะแปลงข้อมูลทั้งหมดเป็น String)
            const { items, totalPrice, paymentMethod, orderType, note } = req.body;
            
            if (!items) return res.status(400).json({ message: "ไม่พบรายการอาหาร" });

            // 2. แปลง Items กลับเป็น Array Object
            const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
            
            // 3. ดึง ID ลูกค้า (รองรับทั้ง req.user.id และ req.user.user.id ขึ้นอยู่กับ Token)
            const userId = req.user?.id || req.user?.user?.id; 
            if (!userId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ" });

            // 4. จัดเตรียมข้อมูลสำหรับตาราง Order
            const orderData = {
                userId: Number(userId),
                orderType: orderType || 'online',
                paymentMethod: paymentMethod || 'transfer',
                status: 'pending',
                totalPrice: parseFloat(totalPrice || 0),
                note: note || ''
            };

            // 5. ถ้ามีการแนบสลิปมา ให้บันทึกชื่อไฟล์ด้วย (paymentStatus อิงตามตาราง Payment ถ้าจำเป็น)
            if (req.file) {
                // ถ้าใน Schema ของ Order ไม่มี slipImage คุณสามารถตัด 2 บรรทัดนี้ออกได้ 
                // แต่ถ้าคุณมี Payment model ให้บันทึกแยก (ในที่นี้บันทึกตาม Schema ที่เคยส่งมา)
            }

            // 6. บันทึกข้อมูลลงฐานข้อมูล (ทำพร้อมกันทั้ง Order และ OrderItem)
            const newOrder = await prisma.order.create({
                data: {
                    ...orderData,
                    items: {
                        create: parsedItems.map(item => ({
                            productId: parseInt(item.product_id || item.id), // ต้องตรงกับชื่อฟิลด์ใน Schema
                            quantity: parseInt(item.quantity),
                            unitPrice: parseFloat(item.price),
                            note: item.note || ''
                        }))
                    }
                }
            });

            // 7. ถ้าโอนเงิน ให้สร้างข้อมูล Payment ด้วย
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
            console.error("Create Order Error:", error);
            res.status(500).json({ message: "สั่งซื้อไม่สำเร็จ: " + error.message });
        }
    });
};