import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
    maxDuration: 60,
};

export default async function handler(req, res) {
    // Configuración CORS
    const allowedOrigins = [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://educadug.github.io',
        'https://familia-guevara-git-main-diego-s-projects-f00e31fc.vercel.app', // URL anterior
        'https://familia-guevara.vercel.app' // Nueva URL limpia añadida
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt, context } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemInstruction = `
            Eres el guardián de la memoria de la familia Guevara-Jauregui.
            Responde preguntas sobre su historia basándote en este contexto:
            ${context}
            
            Si te preguntan por contexto histórico general (gripe 1918, costumbres de boda 1916, minas de asfalto), usa tu conocimiento general para enriquecer la respuesta.
            Sé cálido, respetuoso y nostálgico.
        `;

        const result = await model.generateContent(systemInstruction + "\n\nPregunta: " + prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ answer: text });

    } catch (error) {
        console.error("Error API:", error);
        res.status(500).json({ error: "Error interno", details: error.message });
    }
}
