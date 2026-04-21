require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/Student");

const mapLevel = (raw) => {
  if (!raw) return undefined;
  const value = String(raw).trim().toLowerCase();
  const aliases = {
    beginner: "level1",
    basic: "level1",
    advanced: "level10",
    kid: "kid1",
    "kid beginner": "kid1",
    "kid advanced": "kid2",
  };
  return aliases[value] || value;
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const students = await Student.find({});
  let updated = 0;

  for (const student of students) {
    const nextSkill = mapLevel(student.skillLevel);
    const needsSkillUpdate =
      nextSkill &&
      nextSkill !== student.skillLevel &&
      [
        "kid1",
        "kid2",
        "level1",
        "level2",
        "level3",
        "level4",
        "level5",
        "level6",
        "level7",
        "level8",
        "level9",
        "level10",
      ].includes(nextSkill);

    let dirty = false;
    if (needsSkillUpdate) {
      student.skillLevel = nextSkill;
      dirty = true;
    }
    if (student.totalLessons === undefined) {
      student.totalLessons = 0;
      dirty = true;
    }
    if (student.completedLessons === undefined) {
      student.completedLessons = 0;
      dirty = true;
    }
    if (student.completedLessons > student.totalLessons) {
      student.completedLessons = student.totalLessons;
      dirty = true;
    }

    if (dirty) {
      await student.save();
      updated += 1;
    }
  }

  console.log(`Migration finished. Updated ${updated} student(s).`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Migration failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
