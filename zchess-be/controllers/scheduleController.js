const Schedule = require("../models/Schedule");

/**
 * Lấy schedule theo studentId
 */
exports.getByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const schedule = await Schedule.findOne({ studentId });

    res.json(schedule); // có thể là null nếu chưa tạo
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không lấy được lịch học", error: err.message });
  }
};

/**
 * Tạo mới hoặc cập nhật schedule (UPSERT)
 */
exports.upsertByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { slots, startDate, room } = req.body;

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "Slots không hợp lệ" });
    }

    const schedule = await Schedule.findOneAndUpdate(
      { studentId },
      {
        studentId,
        slots,
        startDate,
        room,
      },
      {
        new: true,
        upsert: true, // ⭐ có thì update, chưa có thì create
        setDefaultsOnInsert: true,
      },
    );

    res.json(schedule);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không lưu được lịch học", error: err.message });
  }
};

/**
 * Xóa schedule theo studentId
 */
exports.deleteByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    await Schedule.findOneAndDelete({ studentId });

    res.json({ message: "Đã xóa lịch học" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không xóa được lịch học", error: err.message });
  }
};
