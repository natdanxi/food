const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // 🟢 เพิ่ม morgan เพื่อดู Log การยิง API
const app = express();

// Middleware
app.use(cors()); 
app.use(express.json({ limit: '20mb' })); 
app.use(morgan('dev')); // 🟢 ช่วยบอกว่า API ไหนเรียกเข้ามา และผลลัพธ์เป็นอย่างไร (สำคัญมากตอน Debug)

// Import Routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user'); 
const shopRouter = require('./routes/shop');       
const categoryRouter = require('./routes/category'); 
const productRouter = require('./routes/product');   
const adminOrderRouter = require('./routes/adminOrder'); 
const userOrderRouter = require('./routes/userOrder');   

// Routes Mounting
app.use('/api', authRouter);
app.use('/api', categoryRouter);
app.use('/api', productRouter);
app.use('/api', shopRouter);
app.use('/api', adminOrderRouter);

// Routes สำหรับผู้ใช้งานทั่วไป
app.use('/api/user', userRouter); 
app.use('/api/user', userOrderRouter);

// Static Files
app.use('/uploads', express.static('uploads'));

// 🟢 Global Error Handler: ดักจับ Error ที่อาจเกิดขึ้นในระบบทั้งหมด
app.use((err, req, res, next) => {
    console.error("🔴 Global Error Handler:", err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// 🟢 404 Handler: ถ้าหา API ไม่เจอ ให้บอกชัดๆ
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});