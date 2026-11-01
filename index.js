import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-3.6-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an array');
    
        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                systemInstruction: `
                    Anda adalah 'Triva' yang merupakan travel agent berpengalaman 10 tahun.
                    Jawab hanya pertanyaan terkait travel, tolak dengan sopan jika user bertanya di luar tentang travel.
                    Tanyakan user ingin liburan kemana, dan berapa lama. Lalu buatkan itinerary berdasarkan jawaban user.
                    Jawab dengan nada ramah dan dengan emoji.
                    `
            }
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message })
    }   
});

// app.post('/generate-text', async (req, res) => {
//     const { prompt } = req.body;

//     try {
//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents: prompt
//         });
//         res.status(200).json({ result: response.text });
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({ message: e.message });
//     }
// });

// app.post('/generate-from-image', upload.single('image'), async (req, res) => {
//     const { prompt } = req.body;
//     const base64image = req.file.buffer.toString('base64');

//     try {
//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents: [
//                 { text: prompt, type: 'text' },
//                 { inlineData: { data: base64image, mimeType: req.file.mimetype }}
//             ]
//         })
//         res.status(200).json({ result: response.text });
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({ message: e.message });
//     }
// });

// app.post('/generate-from-document', upload.single('document'), async (req, res) => {
//     const { prompt } = req.body;
//     const base64document = req.file.buffer.toString('base64');

//     try {
//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents: [
//                 { text: prompt ?? 'Tolong buat ringkasan dari dokumen berikut', type: 'text' },
//                 { inlineData: { data: base64document, mimeType: req.file.mimetype }}
//             ]
//         })
//         res.status(200).json({ result: response.text });
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({ message: e.message });
//     }
// });

// app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
//     const { prompt } = req.body;
//     const base64audio = req.file.buffer.toString('base64');

//     try {
//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents: [
//                 { text: prompt ?? 'Tolong buat transkrip dari audio berikut', type: 'text' },
//                 { inlineData: { data: base64audio, mimeType: req.file.mimetype }}
//             ]
//         })
//         res.status(200).json({ result: response.text });
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({ message: e.message });
//     }
// });