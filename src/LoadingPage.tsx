import { motion } from "motion/react";
import { Sparkles, CakeSlice } from "lucide-react";

export function LoadingPage({ step }: { step: string }) {
  return (
    <div className="flex-1 w-full h-full bg-[#FFF9F2] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#F8BBD0]/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#D7CCC8]/30 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        className="relative flex items-center justify-center w-32 h-32 mb-12 z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 border-[1px] border-[#F48FB1]/30 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-4 border-[1px] border-[#F48FB1]/40 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-8 bg-[#F48FB1]/10 rounded-full flex items-center justify-center backdrop-blur-md"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <CakeSlice className="w-6 h-6 text-[#F48FB1] opacity-90" />
        </motion.div>
      </motion.div>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="h-12 flex items-center justify-center text-center z-10"
      >
        <p className="text-[#4A2E1B] text-[10px] uppercase tracking-[0.2em] font-bold">{step}</p>
      </motion.div>
    </div>
  );
}
