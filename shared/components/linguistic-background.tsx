import { gridPositions } from "@/app/(landing)/constants";
import { motion } from "framer-motion";

export function LinguisticBackground() {
  const characters = [
    // Japanese
    { char: "話", meaning: "Conversation", lang: 'ja' },
    { char: "信", meaning: "Trust", lang: 'ja' },
    { char: "伝", meaning: "Transmit", lang: 'ja' },
    // Korean
    { char: "소통", meaning: "Communication", lang: 'ko' },
    { char: "신뢰", meaning: "Trust", lang: 'ko' },
    { char: "안전", meaning: "Safety", lang: 'ko' },
    // Arabic
    { char: "تواصل", meaning: "Communication", lang: 'ar' },
    { char: "أمان", meaning: "Security", lang: 'ar' },
    { char: "سرعة", meaning: "Speed", lang: 'ar' },
  ];

  // Predefined grid positions (12x12 grid)
  // const gridPositions = Array.from({ length: 144 }).map((_, i) => {
  //   const col = i % 12;
  //   const row = Math.floor(i / 12);
  //   return {
  //     left: (col * 8.33) + 0.5 + Math.random() * 2,
  //     top: (row * 8.33) + 0.5 + Math.random() * 2,
  //     rotation: Math.random() * 45 - 22.5,
  //     scale: 0.8 + Math.random() * 0.4,
  //     fontSize: 16 + (row % 3) * 8
  //   };
  // });

  return (
    // place above the page background but behind main interactive UI
    <div className="fixed inset-0 pointer-events-none z-0 opacity-5 dark:opacity-5 select-none hover:dark:opacity-80">
      
      {gridPositions.map((pos, i) => {
        const { char, meaning, lang } = characters[i % characters.length];
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              fontSize: `${pos.fontSize}px`,
              transform: `rotate(${pos.rotation}deg) scale(${pos.scale})`,
              writingMode: lang === 'ja' ? 'vertical-rl' : 'horizontal-tb'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: i * 0.02
            }}
            aria-hidden="true"
            title={meaning}
          >
            <span className={
              lang === 'ar' ? 'text-2xl' :
                lang === 'ko' ? 'font-medium' : ''
            }>
              {char}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
