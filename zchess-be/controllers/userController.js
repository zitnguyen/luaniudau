const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Auth logic moved to authController.js

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, fullName, email, phone, password, role, specialization, experienceYears, certification, lastname, firstname } = req.body;

    const userExists = await User.findOne({  $or: [{ email }, { username }, { phone }]  });
    if (userExists) {
      return res.status(409).json({ message: "Người dùng đã tồn tại" });
    }

    const finalFullName = `${lastname} ${firstname}`;

    let user;
    if (role === 'Teacher') {
        user = await Teacher.create({
            username,
            fullName: finalFullName,
            email,
            phone,
            password,
            role,
            specialization,
            experienceYears,
            certification
        });
    } else {
        user = await User.create({
            username,
            fullName: finalFullName,
            email,
            phone,
            password,
            role: role || 'Parent'
        });
    }
    
    res.status(201).json({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
    }
    if (user.role === 'Teacher') {
        user = await Teacher.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
    } else {
        user = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
    }
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa người dùng" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'Teacher' });
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
