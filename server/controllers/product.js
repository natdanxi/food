const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ProductModel = prisma.product;

/**
 * ดึงรายการเมนูทั้งหมด
 */
exports.getProducts = async (req, res) => {
    try {
        const products = await ProductModel.findMany({
            include: { category: true },
            // เรียงตามเมนูแนะนำขึ้นก่อน ตามด้วยเมนูขายดี(ยอดนิยม) และเมนูใหม่สุด
            orderBy: [
                { isRecommended: 'desc' }, 
                { soldCount: 'desc' },
                { productId: 'desc' }
            ] 
        });
        res.json(products);
    } catch (err) {
        console.error("Get Products Error:", err);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

/**
 * เพิ่มเมนูใหม่
 */
exports.createProduct = async (req, res) => {
    try {
        const { title, description, price, categoryId, isRecommended, isAvailable } = req.body;
        const imageFile = req.file;

        if (!title) return res.status(400).json({ message: "กรุณาระบุชื่อเมนู" });

        const dataPayload = {
            title: String(title),
            description: description || null,
            price: parseFloat(price) || 0,
            categoryId: parseInt(categoryId) || 0,
            image: imageFile ? imageFile.filename : null,
            // 🟢 รับค่าสวิตช์เปิด-ปิดจากหน้าบ้าน
            isRecommended: isRecommended === 'true',
            isAvailable: isAvailable !== 'false' // ค่าเริ่มต้นคือ true
        };

        const newProduct = await ProductModel.create({ data: dataPayload });
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Create Product Error:", err);
        res.status(500).json({ message: "บันทึกไม่สำเร็จ: " + err.message });
    }
};

/**
 * แก้ไขเมนู
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, categoryId, isRecommended, isAvailable } = req.body;
        const imageFile = req.file;

        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (price) updateData.price = parseFloat(price);
        if (categoryId) updateData.categoryId = parseInt(categoryId);
        if (imageFile) updateData.image = imageFile.filename;
        
        // 🟢 อัปเดตค่าสวิตช์
        if (isRecommended !== undefined) updateData.isRecommended = isRecommended === 'true';
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true';

        const updatedProduct = await ProductModel.update({
            where: { productId: parseInt(id) },
            data: updateData
        });
        
        res.json(updatedProduct);
    } catch (err) {
        console.error("Update Product Error:", err);
        res.status(500).json({ message: "Update Failed: " + err.message });
    }
};

/**
 * ลบเมนู
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await ProductModel.delete({ where: { productId: parseInt(id) } });
        res.json({ message: "ลบเมนูสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "Delete Failed: " + err.message });
    }
};