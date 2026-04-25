import React from "react";

const FieldLabel = ({ label, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {label}
    {required ? <span className="text-red-500 ml-1">*</span> : null}
  </label>
);

const baseInputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const DynamicFormFields = ({
  fields = [],
  values = {},
  errors = {},
  onChange,
}) => {
  return (
    <>
      {fields.map((field) => {
        const value = values[field.name] ?? "";
        const error = errors[field.name];
        const colSpan = field.fullWidth ? "md:col-span-2" : "";

        if (field.type === "select") {
          return (
            <div key={field.name} className={colSpan}>
              <FieldLabel label={field.label} required={field.required} />
              <select
                name={field.name}
                value={value}
                onChange={onChange}
                required={Boolean(field.required)}
                className={`${baseInputClass} bg-white`}
              >
                <option value="">
                  {field.placeholder || `-- Chọn ${field.label.toLowerCase()} --`}
                </option>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
            </div>
          );
        }

        const type = field.type || "text";
        return (
          <div key={field.name} className={colSpan}>
            <FieldLabel label={field.label} required={field.required} />
            <input
              type={type}
              min={field.min}
              name={field.name}
              value={value}
              onChange={onChange}
              required={Boolean(field.required)}
              placeholder={field.placeholder || ""}
              className={baseInputClass}
            />
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
        );
      })}
    </>
  );
};

export default DynamicFormFields;
