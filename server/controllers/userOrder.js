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
 * 🟢 สร้างคำสั่งซื้อใหม่ (รองรับทั้งตะกร้าลูกค้าออนไลน์ และ POS หน้าร้าน)
 */
exports.createOrder = async (req, res) => {
    // ใช้ upload middleware เพื่อรองรับการส่ง FormData
    upload(req, res, async (err) => {
        
        // ✅ ตรวจสอบ Error จาก Multer
        if (err) {
            // อนุญาตให้ผ่านได้ หากเป็นเงินสด หรือ ออเดอร์หน้าร้าน (walkin) ที่ไม่ต้องอัปโหลดรูป
            if (req.body && (req.body.paymentMethod === 'cash' || req.body.orderType === 'walkin')) {
                // ปล่อยผ่าน
            } else {
                console.error("Multer Error:", err); 
                return res.status(400).json({ message: "อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
            }
        }

        try {
            // 1. รับค่า (ปรับให้ยืดหยุ่น รองรับทั้งตัวแปรจากหน้า Cart และ POS)
            const orderItems = req.body.items || req.body.cart;
            const finalTotal = req.body.totalPrice || req.body.cartTotal;
            const { paymentMethod, orderType, note, customerInfo } = req.body;
            
            if (!orderItems) return res.status(400).json({ message: "ไม่พบรายการอาหาร" });

            // 2. เช็คการแนบสลิป: บังคับเฉพาะออเดอร์ "ออนไลน์" ที่เลือก "โอนเงิน" เท่านั้น
            if (orderType !== 'walkin' && paymentMethod === 'transfer' && !req.file) {
                return res.status(400).json({ message: "กรุณาแนบสลิปโอนเงิน" });
            }

            // 3. แปลง Items
            const parsedItems = typeof orderItems === 'string' ? JSON.parse(orderItems) : orderItems;
            
            // 4. ตรวจสอบ User
            const userId = req.user?.id || req.user?.user?.id; 
            if (!userId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ" });

            // 5. เตรียมข้อมูล Order 
            const orderData = {
                userId: Number(userId),
                orderType: orderType || 'online',
                paymentMethod: paymentMethod || 'transfer',
                status: 'pending',
                totalPrice: parseFloat(finalTotal || 0),
                note: note || ''
            };

            // ใส่ชื่อลูกค้า/โต๊ะ (สำหรับหน้าร้าน) แนบไปกับหมายเหตุให้แม่ครัวเห็นด้วย
            if (orderType === 'walkin' && customerInfo) {
                orderData.note = `[ลูกค้า/โต๊ะ: ${customerInfo}] ${orderData.note}`.trim();
            }

            // 6. บันทึกข้อมูลลงฐานข้อมูล
            const newOrder = await prisma.order.create({
                data: {
                    ...orderData,
                    items: {
                        create: parsedItems.map(item => ({
                            // รองรับชื่อฟิลด์จากทั้งสองหน้า
                            productId: parseInt(item.product_id || item.id || item.productId),
                            quantity: parseInt(item.quantity || item.qty),
                            unitPrice: parseFloat(item.price || item.unitPrice),
                            note: item.note || ''
                        }))
                    }
                }
            });

            // 7. บันทึกข้อมูล Payment
            if (paymentMethod === 'transfer' && req.file) {
                // ออนไลน์: โอนเงิน มีไฟล์สลิป
                await prisma.payment.create({
                    data: {
                        ordersId: newOrder.ordersId,
                        paymentMethod: 'transfer',
                        amount: parseFloat(finalTotal || 0),
                        slipImage: req.file.filename,
                        paymentStatus: 'pending'
                    }
                });
            } else if (orderType === 'walkin' || paymentMethod === 'cash') {
                // หน้าร้าน: โอนเงิน/เงินสด (แอดมินยืนยันเอง ไม่ต้องมีสลิปเข้าระบบ) หรือ ออนไลน์: เงินสด
                await prisma.payment.create({
                    data: {
                        ordersId: newOrder.ordersId,
                        paymentMethod: paymentMethod,
                        amount: parseFloat(finalTotal || 0),
                        paymentStatus: 'completed' // ถือว่ารับเงินแล้ว
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