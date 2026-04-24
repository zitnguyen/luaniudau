import { motion } from "framer-motion";

const TeacherCard = ({
  name,
  title,
  image,
  experience,
  specialization,
  actionButtonBgColor,
  actionButtonTextColor,
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-card w-full p-6 text-center group cursor-pointer rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
    >
      {/* Avatar */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ transform: "scale(1.1)" }}
        />
        <img
          src={image}
          alt={name}
          className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg group-hover:border-primary transition-colors duration-300 relative z-10"
        />
      </div>

      {/* Info */}
      <h3 className="font-display text-xl font-semibold text-foreground mb-1">
        {name}
      </h3>
      <p className="text-primary font-medium mb-3">{title}</p>
      <p className="text-sm text-muted-foreground mb-2">{experience}</p>
      <p className="text-sm text-muted-foreground">{specialization}</p>

      {/* Social Links */}
      <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-border">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          style={{
            backgroundColor: actionButtonBgColor || undefined,
            color: actionButtonTextColor || undefined,
          }}
        >
          <span className="text-sm">📧</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          style={{
            backgroundColor: actionButtonBgColor || undefined,
            color: actionButtonTextColor || undefined,
          }}
        >
          <span className="text-sm">📱</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TeacherCard;
