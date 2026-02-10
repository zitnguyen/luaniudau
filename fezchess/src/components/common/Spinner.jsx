const sizes = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const Spinner = ({ size = "md", className = "" }) => {
  return (
    <div
      className={`${sizes[size]} border-2 border-muted border-t-primary rounded-full animate-spin-slow ${className}`}
    />
  );
};

export default Spinner;
