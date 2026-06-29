require('dotenv').config();
const express = require('express'); 
const path = require('path');
const { OpenAI } = require("openai"); 

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Dấu * nghĩa là chấp nhận mọi nguồn gọi vào
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// CẤU HÌNH PHỤC VỤ FILE TĨNH TỪ THƯ MỤC PUBLIC
app.use(express.static(__dirname));

// CẤU HÌNH KẾT NỐI ĐẾN SERVER GROQ QUA THƯ VIỆN OPENAI
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// ==========================================
// API DUY NHẤT: TIẾP NHẬN PROXY CHAT AI
// ==========================================
app.post('/api/ai-chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) return res.status(400).json({ error: "Tin nhắn trống" });
        
        // Gọi mô hình thế hệ mới Llama 3.1 - Chạy siêu tốc và miễn phí hoàn toàn
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { 
                    role: "system", 
                    content: "Bạn là một Trợ lý Tâm lý học học đường thấu cảm học sinh THCS. Hãy trả lời học sinh bằng giọng văn nhẹ nhàng, lắng nghe và định hướng tích cực. Không đưa ra chẩn đoán y khoa nguy hiểm." 
                },
                { 
                    role: "user", 
                    content: userMessage 
                }
            ],
        });

        const replyText = completion.choices[0].message.content;
        res.status(200).json({ reply: replyText });
    } catch (error) {
        console.error("Lỗi xử lý Groq tại Server:", error.message);
        res.status(500).json({ success: false, error: "Hệ thống trợ lý AI đang bận xử lý, em gửi lại sau vài giây nhé!" });
    }
});

// KÍCH HOẠT CỔNG CHẠY SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SERVER WEB TRUNG GIAN DÙNG AI MIỄN PHÍ ĐÃ SẴN SÀNG!`);
    console.log(`👉 Link chạy ứng dụng: http://localhost:${PORT}/Code/trangchu.html`);
    console.log(`====================================================`);
});