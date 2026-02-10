import { motion } from "framer-motion";
import { ClockIcon, UserGroupIcon, StarIcon } from "@heroicons/react/24/outline";

const CourseCard = ({
  title,
  description,
  image,
  level,
  duration,
  students,
  rating,
  price,
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-card w-full group cursor-pointer rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
            {level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{students} học viên</span>
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-primary fill-primary" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-primary">{price}</span>
            <span className="text-sm text-muted-foreground">/khóa</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          >
            Xem chi tiết
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
