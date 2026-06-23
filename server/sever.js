require('dotenv').config(); // 🟢 ย้ายมาไว้บรรทัดแรกสุด สำคัญมาก!
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 
const app = express();

// Middleware
app.use(cors()); 
app.use(express.json({ limit: '20mb' })); 
app.use(morgan('dev')); 

// Import Routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user'); 
const shopRouter = require('./routes/shop');       
const categoryRouter = require('./routes/category'); 
const productRouter = require('./routes/product');   
const adminOrderRouter = require('./routes/adminOrder'); 
const userOrderRouter = require('./routes/userOrder');   

// Routes Mounting
// 🟢 แก้ไขบรรทัดนี้: เติม /auth เข้าไปเพื่อให้ตรงกับที่หน้าบ้านเรียกมา
app.use('/api/auth', authRouter);

app.use('/api', categoryRouter);
app.use('/api', productRouter);
app.use('/api', shopRouter);
app.use('/api', adminOrderRouter);
app.use('/api/user', userRouter); 
app.use('/api', userOrderRouter); 

// Static Files
app.use('/uploads', express.static('uploads'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔴 Global Error Handler:", err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

const http = require('http');
const START_PORT = parseInt(process.env.PORT, 10) || 5000;

function startServer(port, attemptsLeft = 10) {
    const server = http.createServer(app);

    server.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`⚠️ Port ${port} is already in use.`);
            server.close();
            if (attemptsLeft > 0) {
                console.log(`Trying port ${port + 1} (${attemptsLeft - 1} attempts left)...`);
                startServer(port + 1, attemptsLeft - 1);
            } else {
                console.error('❌ No available ports found. Exiting.');
                process.exit(1);
            }
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

startServer(START_PORT, 10);