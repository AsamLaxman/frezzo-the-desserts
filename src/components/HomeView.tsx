import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, CakeSlice, History, QrCode, X } from "lucide-react";
import { Product, Session } from "../types";
import { MOCK_PRODUCTS } from "../data";

export function HomeView({ onGoToShop, onAddToCart, savedDesserts, onViewSession }: { onGoToShop: () => void; onAddToCart: (product: Product) => void; savedDesserts: Session[]; onViewSession: (session: Session) => void; }) {
  const [showQrModal, setShowQrModal] = useState(false);
  const featuredProducts = MOCK_PRODUCTS.slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth z-10 scrollbar-hide pb-24 bg-white relative">
      {/* Hero Section */}
      <div className="relative pt-20 pb-16 px-6 text-center rounded-b-[3rem] overflow-hidden shadow-sm">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1080&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-[#FFF9F2]/80 backdrop-blur-[2px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="w-20 h-20 bg-white/60 backdrop-blur-md border border-white rounded-full flex items-center justify-center mx-auto mb-4 text-[#F48FB1] shadow-lg">
            <CakeSlice className="w-10 h-10" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }} className="text-5xl font-bold tracking-tight text-[#4A2E1B] mb-2 italic">
            Frezzo
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#8B5E3C] mb-6">
            The Desserts
          </p>
          <p className="text-sm font-medium text-[#4A2E1B]/70 max-w-[250px] mx-auto bg-white/40 px-4 py-2 rounded-full border border-white/50 backdrop-blur-sm">
            Dream it, and we bake it.
          </p>
        </motion.div>
      </div>

      {/* Recent Creations Section */}
      {savedDesserts && savedDesserts.length > 0 && (
        <div className="pt-8 bg-white min-h-full">
          <div className="px-6 flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }} className="text-xl font-bold text-[#4A2E1B] flex items-center gap-2">
              <History className="w-5 h-5 text-[#F48FB1]" /> Recent Creations
            </h2>
          </div>
          
          <div className="flex overflow-x-auto gap-4 px-6 pb-4 scrollbar-hide snap-x">
            {savedDesserts.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => onViewSession(session)}
                className="bg-[#FFF9F2] border border-[#EAE0D5] rounded-2xl p-3 w-[200px] shrink-0 snap-start shadow-sm cursor-pointer hover:border-[#F48FB1] hover:shadow-md transition-all group"
              >
                <div className="w-full h-[120px] bg-[#EAE0D5] rounded-xl overflow-hidden mb-3 relative">
                  <img src={session.imageUrl} alt={session.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-300" /> AI
                  </div>
                </div>
                <h3 className="font-bold text-[#4A2E1B] text-sm mb-1 line-clamp-1">{session.title}</h3>
                <p className="text-[10px] text-[#A89F91] line-clamp-2">{session.script}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      <div className="px-6 py-8 bg-white min-h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }} className="text-xl font-bold text-[#4A2E1B]">Featured Treats</h2>
          <button onClick={onGoToShop} className="text-[#F48FB1] text-xs font-bold flex items-center gap-1 uppercase tracking-widest hover:text-[#F06292] transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-4">
          {featuredProducts.map((product, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              key={product.id}
              className="bg-[#FFF9F2] border border-[#EAE0D5] rounded-2xl p-3 flex gap-4 items-center shadow-sm"
            >
              <div className="w-20 h-20 bg-[#EAE0D5] rounded-xl overflow-hidden shrink-0">
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#4A2E1B] text-sm mb-1">{product.title}</h3>
                <p className="text-[10px] text-[#A89F91] line-clamp-1 mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A2E1B]">₹{product.price}</span>
                  <button 
                    onClick={() => onAddToCart(product)}
                    className="bg-white border border-[#EAE0D5] w-8 h-8 rounded-full flex items-center justify-center text-[#4A2E1B] hover:text-[#F48FB1] hover:border-[#F48FB1] transition-colors shadow-sm"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowQrModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#4A2E1B] text-[#FFF9F2] rounded-full flex items-center justify-center shadow-lg hover:bg-[#8B5E3C] hover:scale-105 transition-all z-20"
      >
        <QrCode className="w-6 h-6" />
      </button>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFF9F2] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full text-[#4A2E1B] hover:bg-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-[#F48FB1] shadow-sm">
                  <CakeSlice className="w-8 h-8" />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }} className="text-2xl font-bold text-[#4A2E1B] mb-2 italic">
                  Digital Menu
                </h3>
                <p className="text-sm text-[#8B5E3C] mb-8">
                  Scan to view our full physical menu on your device.
                </p>
                
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE0D5] w-full flex flex-col items-center justify-center aspect-square relative">
                   <QrCode className="w-full h-full text-[#4A2E1B] opacity-80" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-[#EAE0D5]">
                         <CakeSlice className="w-6 h-6 text-[#F48FB1]" />
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="bg-[#4A2E1B] text-[#FFF9F2] py-4 text-center">
                <p className="text-xs font-semibold tracking-widest uppercase text-white/80">Scan at Counter</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
