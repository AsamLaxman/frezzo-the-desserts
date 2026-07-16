import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Plus, Heart, Trash2 } from "lucide-react";
import { Product, Session } from "../types";
import { MOCK_PRODUCTS } from "../data";
import { cn } from "../lib/utils";

export function ShopView({ onAddToCart, savedDesserts = [], onViewSession, onAddCustomToCart, onRemoveSavedDessert }: { onAddToCart: (product: Product) => void; savedDesserts?: Session[]; onViewSession?: (session: Session) => void; onAddCustomToCart?: (session: Session) => void; onRemoveSavedDessert?: (session: Session) => void; }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const scrollRef = useRef<HTMLDivElement>(null);

  const baseCategories = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)));
  const categories = ["All", ...baseCategories];
  if (savedDesserts.length > 0) {
    categories.push("Saved Desserts");
  }
  
  const filteredProducts = activeCategory === "All" || (!["Saved Desserts"].includes(activeCategory))
    ? MOCK_PRODUCTS.filter(p => activeCategory === "All" || p.category === activeCategory)
    : [];

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth z-10 pt-2 scrollbar-hide pb-24 bg-[#EBE3DB] relative">
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden opacity-10 mix-blend-multiply">
          <span className="text-[150px] font-bold italic text-[#8B5E3C] whitespace-nowrap transform -rotate-12 select-none">fssai</span>
          <span className="text-[80px] font-bold text-green-700 whitespace-nowrap tracking-[0.5em] mt-8 select-none">APPROVED</span>
      </div>
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <div className="text-center py-6 mb-4">
          <h1 className="text-5xl font-bold text-[#F48FB1] mb-1 font-serif">Frezzo</h1>
          <h2 className="text-3xl font-black text-[#2C1810] tracking-widest uppercase mb-4 drop-shadow-sm">THE DESSERTS</h2>
          <div className="inline-block bg-[#2C1810] text-[#FFF9F2] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-xl">
            Wholesale Price
          </div>
          <p className="text-[#8B5E3C] text-[11px] font-bold uppercase tracking-widest">
            For Cafes, Restaurants & Bakeries
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
                activeCategory === category 
                  ? "bg-[#4A2E1B] text-[#FFF9F2] border-[#4A2E1B]"
                  : "bg-white text-[#4A2E1B] border-[#EAE0D5] hover:bg-[#EAE0D5]"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={product.id}
              className="bg-white border border-[#EAE0D5] rounded-2xl overflow-hidden flex flex-col shadow-sm group"
            >
              <div className="h-32 w-full bg-[#EAE0D5] relative overflow-hidden">
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-[#2C1810] text-[#FFF9F2] px-3 py-1 rounded-lg text-sm font-black shadow-xl border-2 border-[#F48FB1] transform rotate-3">
                  ₹{product.price}
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h4 className="text-sm font-bold text-[#4A2E1B] mb-1 line-clamp-1">{product.title}</h4>
                <p className="text-[10px] text-[#A89F91] line-clamp-2 flex-1 mb-3">{product.description}</p>
                <button 
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-[#FFF9F2] border border-[#EAE0D5] text-[#4A2E1B] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:border-[#F48FB1] hover:text-[#F48FB1] transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </motion.div>
          ))}
          <AnimatePresence>
            {(activeCategory === "All" || activeCategory === "Saved Desserts") && savedDesserts.map((session, i) => (
              <motion.div 
                layout
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                transition={{ duration: 0.3 }}
                key={session.id}
                className="relative overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end px-4 text-white z-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <motion.div 
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0.5, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -80) {
                      onRemoveSavedDessert && onRemoveSavedDessert(session);
                    }
                  }}
                  onClick={() => onViewSession && onViewSession(session)}
                  className="bg-white border border-[#EAE0D5] rounded-2xl overflow-hidden flex flex-col shadow-sm group cursor-pointer hover:border-[#F48FB1] transition-colors relative z-10 touch-pan-y h-full"
                >
                  <div className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[#F48FB1] shadow-sm">
                    <Heart className="w-3 h-3" fill="currentColor" />
                  </div>
                  <div className="h-32 w-full bg-[#EAE0D5] relative overflow-hidden">
                    {session.imageUrl ? (
                      <img src={session.imageUrl} alt={session.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#A89F91]">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-[#F8BBD0] to-[#F48FB1] text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm pointer-events-none">
                      Custom
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-center pointer-events-none">
                    <h4 className="text-sm font-bold text-[#4A2E1B] mb-1 line-clamp-2">{session.title}</h4>
                    <p className="text-[10px] text-[#A89F91] line-clamp-1 mb-2">Saved Custom Dessert</p>
                    <div className="flex gap-2 mt-auto pointer-events-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddCustomToCart && onAddCustomToCart(session);
                        }}
                        className="flex-1 bg-[#FFF9F2] border border-[#EAE0D5] text-[#4A2E1B] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:border-[#F48FB1] hover:text-[#F48FB1] transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Reorder
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewSession && onViewSession(session);
                        }}
                        className="bg-[#FFF9F2] border border-[#EAE0D5] text-[#4A2E1B] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center hover:border-[#F48FB1] hover:text-[#F48FB1] transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
