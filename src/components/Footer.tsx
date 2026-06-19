import { motion } from 'framer-motion';

export function Footer() {
  const footerCols = [
    {
      title: '购物指南',
      links: ['购物流程', '配送说明', '退换政策', 'FAQ'],
    },
    {
      title: '关于我们',
      links: ['品牌故事', '工艺传承', '可持续发展', '招贤纳士'],
    },
    {
      title: '服务支持',
      links: ['预约鉴赏', '保养护理', '正品验证', '隐私政策'],
    },
  ];

  return (
    <footer className="bg-[#0d0521]/80 border-t border-border pt-20 pb-8 px-6 md:px-16 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <span
                className="font-heading italic text-2xl"
                style={{
                  background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ÉCLAT · 甄选奢品
              </span>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed mb-6 max-w-[240px]">
              甄选全球奢品，匠心独运，为每一位鉴赏家呈现卓越品质与永恒之美。
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {['微信', '微博', '抖音', '小红书'].map((s) => (
                <div
                  key={s}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground/50 hover:text-primary hover:border-primary/50 transition-colors cursor-pointer text-xs"
                >
                  {s.charAt(0)}
                </div>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-6">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/40">
          <span>© 2026 ÉCLAT · 甄选奢品 版权所有</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground/60 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-foreground/60 transition-colors">使用条款</a>
            <a href="#" className="hover:text-foreground/60 transition-colors">无障碍声明</a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
