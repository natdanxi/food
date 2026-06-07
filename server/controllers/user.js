const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UserModel = prisma.user || prisma.users;

exports.getUserProfile = async (req, res) => {
    try {
        let userId = req.user?.id || req.user?.user?.id;
        if (!userId) return res.status(401).json({ message: "กุญแจไม่สมบูรณ์" });

        const user = await UserModel.findFirst({
            where: { id: Number(userId) }
        });

        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        
        delete user.password;
        res.json(user);
    } catch (err) {
        console.error("Get Profile Error:", err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        let userId = req.user?.id || req.user?.user?.id;
        const { firstname, lastname, tel, address } = req.body;

        const updatedUser = await UserModel.update({
            where: { id: Number(userId) },
            data: { firstname, lastname, tel, address }
        });

        delete updatedUser.password;
        res.json({ message: "อัปเดตสำเร็จ", user: updatedUser });
    } catch (err) {
        console.error("Update Profile Error:", err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};