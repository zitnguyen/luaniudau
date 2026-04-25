const { getFormMetadata, listForms } = require("../config/formMetadata");

exports.getForms = (_req, res) => {
  res.json({
    items: listForms(),
  });
};

exports.getFormById = (req, res) => {
  const formId = String(req.params.formId || "").trim();
  const mode = String(req.query.mode || "create").trim().toLowerCase();
  const data = getFormMetadata(formId, mode);
  if (!data) {
    return res.status(404).json({
      message: "Form metadata not found",
    });
  }
  return res.json(data);
};
