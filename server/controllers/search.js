// นำเข้า PrismaClient สำหรับการเชื่อมต่อฐานข้อมูล
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// ฟังก์ชันสำหรับการค้นหาสินค้าด้วยตัวกรอง
exports.searchFilters = async (req, res) => {
    try {
        const { query, price, category } = req.body;
        const where = {};

        // กรองสินค้าตามชื่อ
        if (query) {
            where.title = { contains: query, mode: 'insensitive' };
        }
        // กรองสินค้าตามช่วงราคา
        if (price) {
            where.price = { gte: price[0], lte: price[1] };
        }
        // กรองสินค้าตามหมวดหมู่
        if (category && category.length > 0) {
            where.category_id = { in: category.map((id) => Number(id)) };
        }

        // ดึงรายการสินค้าที่ตรงกับตัวกรอง
        const products = await prisma.products.findMany({
            where: where,
            orderBy: { created_at: 'desc' },
            include: { category: true }
        });
        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(500).send('Search Error');
    }
};