
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { message } = req.body || {};

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 1000
  ) {
    return res.status(400).json({
      error: "Please enter a message of up to 1000 characters."
    });
  }

  const backendUrl = process.env.RAG_BACKEND_URL;
  const apiKey = process.env.RAG_API_KEY;

  if (!backendUrl || !apiKey) {
    return res.status(500).json({
      error: "Chat service is not configured yet."
    });
  }

  try {
    const response = await fetch(
      `${backendUrl.replace(/\/+$/, "")}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          message: message.trim()
        }),
        signal: AbortSignal.timeout(60000)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || typeof data.answer !== "string") {
      return res.status(502).json({
        error: "The AI service is temporarily unavailable."
      });
    }

    return res.status(200).json({
      answer: data.answer
    });
  } catch (error) {
    return res.status(502).json({
      error: "Could not connect to the AI service. Please try again."
    });
  }
};
