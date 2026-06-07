/**
 * @file category.js
 * @description Controller จัดการหมวดหมู่ (แก้ไขชื่อฟิลด์ให้ตรง Schema 100%)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// อ้างอิง Model ให้ถูกต้อง
const CategoryModel = prisma.category;

/**
 * @desc    สร้างหมวดหมู่ใหม่
 * @route   POST /api/category
 */
exports.createCategory = async (req, res) => {
    try {
        // 1. ตรวจสอบ Middleware: ถ้า req.body เป็น undefined แสดงว่าใน sever.js ลืมใช้ app.use(express.json())
        if (!req.body) {
            return res.status(400).json({ message: "ไม่ได้รับข้อมูลจากหน้าบ้าน (Request body is empty)" });
        }

        // 2. ดึงข้อมูล: ยอมรับทั้ง categoryName หรือ name
        const categoryName = req.body.categoryName || req.body.name;
        
        console.log("DEBUG - ข้อมูลที่ได้รับ:", req.body); // 🟢 ดูใน Terminal

        // 3. Validation: ตรวจสอบความถูกต้อง
        if (!categoryName || typeof categoryName !== 'string' || categoryName.trim() === "") {
            return res.status(400).json({ message: "ชื่อหมวดหมู่ไม่ถูกต้อง" });
        }

        // 4. Save: ใช้ชื่อฟิลด์ categoryName ให้ตรงกับ schema.prisma เป๊ะๆ
        const category = await CategoryModel.create({
            data: { categoryName: categoryName.trim() } 
        });
        
        res.status(201).json(category);
    } catch (err) {
        console.error("Create Error:", err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

/**
 * @desc    อัปเดตข้อมูลหมวดหมู่
 */
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryName = req.body.categoryName || req.body.name;

        if (!categoryName) {
            return res.status(400).json({ message: "กรุณาระบุชื่อหมวดหมู่" });
        }

        const category = await CategoryModel.update({
            where: { categoryId: Number(id) }, 
            data: { categoryName: categoryName.trim() }
        });
        
        res.json(category);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ message: "ไม่สามารถอัปเดตได้: " + err.message });
    }
};

// GET และ DELETE คงเดิม
exports.getCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.findMany({ orderBy: { categoryId: 'asc' } });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "ดึงข้อมูลล้มเหลว" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await CategoryModel.delete({ where: { categoryId: Number(id) } });
        res.json({ message: "ลบสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "หมวดหมู่นี้มีการใช้งานอยู่ ลบไม่ได้ครับ" });
    }
};