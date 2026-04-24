const asyncHandler = require("../middleware/asyncHandler");

const LICHESS_ACCOUNT_API = "https://lichess.org/api/account";

exports.getMyLichessAccount = asyncHandler(async (_req, res) => {
  const token = String(process.env.LICHESS_API_TOKEN || "").trim();
  if (!token) {
    return res.status(500).json({
      message: "LICHESS_API_TOKEN chưa được cấu hình trong môi trường server",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(LICHESS_ACCOUNT_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Gọi Lichess API thất bại",
        details: payload,
      });
    }

    return res.json(payload);
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({ message: "Lichess API timeout" });
    }
    return res.status(500).json({
      message: "Không thể kết nối Lichess API",
      error: error.message,
    });
  } finally {
    clearTimeout(timeout);
  }
});
