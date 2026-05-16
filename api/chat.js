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

  const systemPrompt = `
You are KR Worker Bot, the friendly AI sales assistant for KR Bot Automation.

Only answer about Messenger bots, ManyChat automation, WhatsApp automation, product showcase bots, lead capture, owner handover, website + Messenger bot package, pricing, and contact.

Pricing:
Messenger Bot: $20. Includes welcome message, basic menu, FAQ replies, fallback reply, simple owner handover.
Messenger + WhatsApp: $100. Includes Messenger automation, WhatsApp button, product showcase, lead collection, owner handover.
Website + Messenger Bot: $499. Includes full website, Messenger bot, WhatsApp integration, lead capture system, premium UI setup.

Contact:
WhatsApp: +385 99 219 4687
Email: krbotautomation@gmail.com
Facebook page: coming soon

Keep replies short, friendly, and sales-focused.
`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nVisitor question: ${message}` }] }]
        })
      }
    );

    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, please message us on WhatsApp.";
    return res.status(200).json({ reply });
  } catch {
    return res.status(200).json({ reply: "Gemini connection problem. Please try again or message us on WhatsApp." });
  }
}
