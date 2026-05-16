export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Method not allowed." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      reply: "Gemini is not connected yet. Add GEMINI_API_KEY in Vercel Environment Variables, then redeploy."
    });
  }

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ reply: "Please type a question." });

  const prompt = `
You are KR Worker Bot, sales assistant for KR Bot Automation.
Pricing:
Messenger Bot: $20.
Messenger + WhatsApp: $100.
Website + Messenger Bot: $499.
Contact:
WhatsApp +385 99 219 4687
Email krbotautomation@gmail.com

Answer only about bot automation, WhatsApp, Messenger, lead capture, website packages, and pricing.
Keep replies short and friendly.

Visitor question: ${message}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
      }
    );
    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Please message us on WhatsApp for help.";
    return res.status(200).json({ reply });
  } catch {
    return res.status(200).json({ reply: "Gemini connection problem. Please message us on WhatsApp." });
  }
}
