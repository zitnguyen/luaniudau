const studentBaseFields = [
  { name: "fullName", label: "Họ và tên", type: "text", required: true },
  { name: "dateOfBirth", label: "Ngày sinh", type: "date", required: false },
  { name: "enrollmentDate", label: "Ngày nhập học", type: "date", required: false },
  {
    name: "skillLevel",
    label: "Level",
    type: "select",
    required: false,
    options: [
      { value: "kid1", label: "Mẫu giáo 1" },
      { value: "kid2", label: "Mẫu giáo 2" },
      { value: "level1", label: "Level 1" },
      { value: "level2", label: "Level 2" },
      { value: "level3", label: "Level 3" },
      { value: "level4", label: "Level 4" },
      { value: "level5", label: "Level 5" },
      { value: "level6", label: "Level 6" },
      { value: "level7", label: "Level 7" },
      { value: "level8", label: "Level 8" },
      { value: "level9", label: "Level 9" },
      { value: "level10", label: "Level 10" },
    ],
  },
  {
    name: "gender",
    label: "Giới tính",
    type: "select",
    required: false,
    options: [
      { value: "male", label: "Nam" },
      { value: "female", label: "Nữ" },
      { value: "other", label: "Khác" },
    ],
  },
  { name: "phone", label: "SĐT", type: "text", required: false },
  { name: "address", label: "Địa chỉ", type: "text", required: false },
  {
    name: "parentId",
    label: "Phụ huynh",
    type: "select",
    required: true,
    optionsSource: "parents",
  },
  { name: "totalSessions", label: "Tổng số buổi", type: "number", required: false, min: 0 },
  {
    name: "completedLessons",
    label: "Số buổi đã học",
    type: "number",
    required: false,
    min: 0,
  },
];

const registry = {
  student: {
    label: "Học viên",
    modes: {
      create: {
        fields: studentBaseFields,
      },
      update: {
        fields: [
          ...studentBaseFields,
          {
            name: "status",
            label: "Trạng thái",
            type: "select",
            required: false,
            options: [
              { value: "active", label: "Đang học" },
              { value: "completed", label: "Hoàn thành" },
            ],
          },
        ],
      },
      filter: {
        fields: [
          {
            name: "keyword",
            label: "Từ khóa",
            type: "text",
            required: false,
            placeholder: "Tìm theo tên học viên hoặc phụ huynh",
          },
          {
            name: "status",
            label: "Trạng thái",
            type: "select",
            required: false,
            options: [
              { value: "all", label: "Tất cả trạng thái" },
              { value: "active", label: "Đang học" },
              { value: "completed", label: "Hoàn thành" },
            ],
          },
        ],
      },
    },
  },
};

const listForms = () =>
  Object.entries(registry).map(([formId, value]) => ({
    formId,
    label: value.label,
    modes: Object.keys(value.modes || {}),
  }));

const getFormMetadata = (formId, mode = "create") => {
  const form = registry[formId];
  if (!form) return null;
  const selectedMode = form.modes?.[mode] || form.modes?.create || { fields: [] };
  return {
    formId,
    label: form.label,
    mode,
    fields: selectedMode.fields || [],
  };
};

module.exports = {
  listForms,
  getFormMetadata,
};
