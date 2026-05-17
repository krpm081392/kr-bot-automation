export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const message = req.body?.message || "";

  if (!apiKey) {
    return res.status(200).json({ reply: "" });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "You are KR Worker Bot, a friendly sales assistant for KR Bot Automation. Keep answers short, helpful, and sales-focused. Services: Messenger Bot $20, Messenger + WhatsApp Bot $100, Website + Messenger Bot $499. Features: auto replies, FAQ, product showcase, lead collection, WhatsApp handover, website automation. User asked: " +
                    message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(200).json({ reply: "" });
  }
}
