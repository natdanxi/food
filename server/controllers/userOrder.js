/**
 * 🟢 สร้างคำสั่งซื้อใหม่ (รองรับทั้งตะกร้าลูกค้าออนไลน์ และ POS หน้าร้าน)
 */
exports.createOrder = async (req, res) => {
    // 🟢 ตรวจสอบประเภทออเดอร์ก่อน: ถ้าเป็นออเดอร์หน้าร้าน (POS) ให้ข้ามขั้นตอนเช็คไฟล์ไปเลย
    if (req.body && req.body.orderType === 'walkin') {
        return processWalkinOrder(req, res); // ไปแยกฟังก์ชันประมวลผลหน้าร้านแบบไม่มีไฟล์
    }

    // สำหรับออเดอร์ออนไลน์ ให้รันระบบเช็คอัปโหลดไฟล์สลิปตามปกติ
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer Error:", err); 
            return res.status(400).json({ message: "อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
        }
        await saveOnlineOrder(req, res, req.file);
    });
};

// 🟢 เพิ่มฟังก์ชันสำหรับประมวลผลหน้าร้าน (POS) แบบไม่มีไฟล์เข้ามารบกวน
const processWalkinOrder = async (req, res) => {
    try {
        const { cart, cartTotal, paymentMethod, customerInfo } = req.body;
        if (!cart || cart.length === 0) return res.status(400).json({ message: "ไม่พบรายการอาหาร" });

        const userId = req.user?.id || req.user?.user?.id; 
        if (!userId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });

        const newOrder = await prisma.order.create({
            data: {
                userId: Number(userId),
                orderType: 'walkin',
                paymentMethod: paymentMethod || 'cash',
                status: 'completed', // หน้าร้านถือว่าเสร็จสิ้นและรับเงินแล้ว
                totalPrice: parseFloat(cartTotal || 0),
                note: `[ลูกค้า/โต๊ะ: ${customerInfo || 'หน้าร้าน'}]`,
                items: {
                    create: cart.map(item => ({
                        productId: parseInt(item.productId || item.id),
                        quantity: parseInt(item.qty),
                        unitPrice: parseFloat(item.price),
                        note: item.note || ''
                    }))
                }
            }
        });

        await prisma.payment.create({
            data: {
                ordersId: newOrder.ordersId,
                paymentMethod: paymentMethod || 'cash',
                amount: parseFloat(cartTotal || 0),
                paymentStatus: 'completed'
            }
        });

        res.status(201).json({ message: "บันทึกคำสั่งซื้อหน้าร้านสำเร็จ", orderId: newOrder.ordersId });
    } catch (error) {
        console.error("Walkin Order Error:", error);
        res.status(500).json({ message: "บันทึกข้อมูลหน้าร้านไม่สำเร็จ: " + error.message });
    }
};

// 🟢 ฟังก์ชันสำหรับออเดอร์ออนไลน์ (โค้ดเดิมของคุณ)
const saveOnlineOrder = async (req, res, file) => {
    try {
        const { items, totalPrice, paymentMethod, orderType, note } = req.body;
        if (!items) return res.status(400).json({ message: "ไม่พบรายการอาหาร" });

        if (paymentMethod === 'transfer' && !file) {
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

        if (paymentMethod === 'transfer' && file) {
            await prisma.payment.create({
                data: {
                    ordersId: newOrder.ordersId,
                    paymentMethod: 'transfer',
                    amount: parseFloat(totalPrice || 0),
                    slipImage: file.filename,
                    paymentStatus: 'pending'
                }
            });
        }

        res.status(201).json({ message: "สั่งซื้อสำเร็จ", orderId: newOrder.ordersId });
    } catch (error) {
        console.error("Save Online Order Error:", error);
        res.status(500).json({ message: "สั่งซื้อไม่สำเร็จ: " + error.message });
    }
};