const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "7d",
  });
};

//sign up
exports.signup = async (req, res) => {
  try {
    const { username, password, email, fullName, phone } = req.body;

    // 1️⃣ Check rỗng
    if (!username || !password || !phone) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ username, password và số điện thoại",
      });
    }

    // 2️⃣ Password
    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // 3️⃣ Email (nếu có)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ" });
      }
    }

    // 4️⃣ Phone
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Số điện thoại phải bắt đầu bằng 0 và có 10–11 chữ số",
      });
    }

    // 5️⃣ Check trùng
    if (await User.findOne({ username })) {
      return res.status(409).json({ message: "Username đã tồn tại" });
    }

    if (email && (await User.findOne({ email }))) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }

    if (await User.findOne({ phone })) {
      return res.status(409).json({ message: "Số điện thoại đã được sử dụng" });
    }

    // 6️⃣ Create user
    const user = await User.create({
      username,
      password,
      email,
      fullName,
      phone,
      role: "Parent",
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      userId: user._id,
      username: user.username,
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);

    // Mongo duplicate fallback
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Dữ liệu đã tồn tại",
      });
    }

    return res.status(500).json({
      message: "Lỗi server, vui lòng thử lại",
    });
  }
};

//sign in
exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập username và password" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      userId: user._id,
      accessToken,
      username: user.username,
      fullName: user.fullName || "",
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//sign out
exports.signout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Đăng xuất thành công" });
};
//refresh token
exports.refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Không tìm thấy token trong cookie" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
      }

      const accessToken = generateAccessToken(decoded.id);
      res.json({ accessToken });
    },
  );
};
