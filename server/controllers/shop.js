const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

exports.getShopInfo = async (req, res) => {
    try {
        let shop = await prisma.shopInfo.findFirst();
        
        if (!shop) {
            shop = await prisma.shopInfo.create({ 
                data: { shopName: "ร้านอาหารแม่ครัวตัวกลม", address: "ยังไม่ระบุที่อยู่" } 
            });
        }
        res.json(shop);
    } catch (err) {
        console.error("Get Shop Info Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✨ แก้ชื่อเป็น updateShop และถอดระบบอัปโหลดไปไว้ที่ Middleware แทนแล้ว
exports.updateShop = async (req, res) => {
    try {
        const { name, phone, address, openTime, closeTime, isOpen, removeLogo, removeQrCode } = req.body;
        
        let shop = await prisma.shopInfo.findFirst();
        if (!shop) {
            shop = await prisma.shopInfo.create({ 
                data: { shopName: name || "ร้านอาหารแม่ครัวตัวกลม" } 
            });
        }

        const data = {
            shopName: name || shop.shopName,
            phone: phone || shop.phone,
            address: address || shop.address,
            openTime: openTime || shop.openTime,
            closeTime: closeTime || shop.closeTime,
            isOpen: isOpen !== undefined ? isOpen === 'true' : shop.isOpen 
        };

        // 🟢 รูปภาพจะถูกส่งมาจาก Middleware (upload.js) แล้วมาอยู่ใน req.files
        if (req.files && req.files['logo']) {
            data.logo = req.files['logo'][0].filename;
        } else if (removeLogo === 'true') {
            data.logo = null;
        }

        // 🟢 หากกดลบรูป QR ให้ลบไฟล์ออกจากเครื่อง Server เลย
        if (removeQrCode === 'true') {
            const qrFiles = fs.readdirSync('uploads/').filter(fn => fn.startsWith('shop-qrcode'));
            qrFiles.forEach(file => fs.unlinkSync(path.join('uploads/', file)));
        }

        const updatedShop = await prisma.shopInfo.update({
            where: { shopId: shop.shopId }, // 🟢 สำคัญ! ใช้ shopId
            data: data
        });

        res.json(updatedShop);
    } catch (error) {
        console.error("Update Shop Error:", error);
        res.status(500).json({ message: "บันทึกข้อมูลไม่สำเร็จ", error: error.message });
    }
};

exports.checkShopStatus = async (req, res) => {
    try {
        const shop = await prisma.shopInfo.findFirst();
        if (!shop) return res.json({ isOpenNow: false, reason: "ไม่มีข้อมูลร้านค้า" });
        if (!shop.isOpen) return res.json({ isOpenNow: false, reason: "ร้านปิดให้บริการ", shop });

        if (shop.openTime && shop.closeTime) {
            const now = new Date();
            const openTimeParts = shop.openTime.split(':');
            const closeTimeParts = shop.closeTime.split(':');
            const openDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(openTimeParts[0]), parseInt(openTimeParts[1]), 0);
            const closeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(closeTimeParts[0]), parseInt(closeTimeParts[1]), 0);

            if (now < openDate || now > closeDate) {
                return res.json({ isOpenNow: false, reason: `นอกเวลาทำการ`, shop });
            }
        }
        res.json({ isOpenNow: true, reason: '', shop });
    } catch (err) {
        console.error("Check Shop Status Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};