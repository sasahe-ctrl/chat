// Netlify Function: 中转聊天请求，把 API key 留在服务端，前端永远看不到。
// 前端调用 /.netlify/functions/chat ，由这里再去请求 leafapi。

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.LEAFAPI_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "服务端缺少 LEAFAPI_KEY 环境变量" }),
    };
  }

  try {
    const incoming = JSON.parse(event.body || "{}");

    const res = await fetch("https://leafapi.cc/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: incoming.model || "claude-opus-4-7",
        messages: incoming.messages,
      }),
    });

    const data = await res.json();

    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(e && e.message ? e.message : e) }),
    };
  }
};
