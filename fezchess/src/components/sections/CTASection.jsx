import { motion } from "framer-motion";
import ScrollReveal from "../common/ScrollReveal";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-secondary p-8 md:p-16">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 text-[200px] opacity-5 select-none leading-none">
              ♔
            </div>
            <div className="absolute bottom-0 left-0 text-[150px] opacity-5 select-none leading-none">
              ♟
            </div>

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-foreground mb-6"
              >
                Bắt đầu hành trình cờ vua{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">ngay hôm nay</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground mb-8"
              >
                Đăng ký học thử miễn phí 2 buổi đầu tiên. Không yêu cầu cam kết
                – chỉ cần niềm đam mê học hỏi!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-primary text-primary-foreground text-lg px-8 py-4 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                  >
                    Đăng ký học thử miễn phí
                  </motion.button>
                </Link>
                <Link to="/courses">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-transparent border-2 border-secondary-foreground/20 text-secondary-foreground rounded-xl font-medium hover:border-primary transition-colors duration-300"
                  >
                    Tìm hiểu thêm
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>Học thử miễn phí</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>Không ràng buộc</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>Hoàn tiền 100%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
