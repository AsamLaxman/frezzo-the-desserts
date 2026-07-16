import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Trash2, ChevronRight, Bell } from "lucide-react";
import { CartItem } from "../types";
import { cn } from "../lib/utils";

export function CartView({ cartItems, onRemoveItem, onCheckout }: { cartItems: CartItem[]; onRemoveItem: (id: string) => void; onCheckout: (method: 'delivery' | 'pickup') => void; }) {
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'delivery' && cartItems.length > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-smooth z-10 pt-2 scrollbar-hide pb-24">
      <div className="max-w-2xl mx-auto flex flex-col min-h-full">
        <h2 style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }} className="text-2xl font-bold tracking-tight text-[#4A2E1B] mb-6">
          Your Cart
        </h2>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <ShoppingBag className="w-12 h-12 text-[#8B5E3C] mb-4" />
            <p className="text-sm font-semibold text-[#8B5E3C]">Your cart is empty.</p>
            <p className="text-xs text-[#8B5E3C] mt-1 max-w-[200px]">Add some delicious treats to get started!</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout
                    initial={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.8, x: -100, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end px-6 text-white z-0">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <motion.div 
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={{ left: 0.5, right: 0 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.x < -100) {
                          onRemoveItem(item.id);
                        }
                      }}
                      className="bg-white border border-[#EAE0D5] rounded-2xl p-4 flex gap-4 shadow-sm relative z-10 touch-pan-y"
                    >
                      <div className="w-20 h-20 rounded-xl bg-[#EAE0D5] overflow-hidden shrink-0 shadow-inner">
                        {item.type === 'standard' && item.product?.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover pointer-events-none" />
                        ) : item.type === 'custom' && item.customSession?.imageUrl ? (
                          <img src={item.customSession.imageUrl} alt={item.customSession.title} className="w-full h-full object-cover pointer-events-none" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#A89F91]">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center pointer-events-none">
                        <p className="text-sm font-bold text-[#4A2E1B] truncate mb-1">
                          {item.type === 'standard' ? item.product?.title : item.customSession?.title}
                        </p>
                        <p className="text-xs text-[#8B5E3C] mb-2 font-medium">Qty: {item.quantity}</p>
                        <div className="flex items-center justify-between pointer-events-auto mt-2">
                          <span className="text-sm font-bold text-[#4A2E1B]">₹{item.price.toFixed(2)}</span>
                          <button 
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#A89F91] hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {item.type === 'custom' && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#F8BBD0] to-[#F48FB1] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm pointer-events-none">
                          AI Custom
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 bg-white border border-[#EAE0D5] rounded-3xl p-6 shadow-sm">
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-[#8B5E3C]">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between text-[#8B5E3C]">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-[#EAE0D5] w-full my-4" />
                
                {/* Delivery Options */}
                <div className="space-y-1 mt-4">
                  <label className="text-xs uppercase tracking-widest text-[#8B5E3C] font-bold">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setDeliveryMethod('delivery')}
                      className={cn("py-2 rounded-xl text-xs font-bold transition-colors border", deliveryMethod === 'delivery' ? "bg-[#FFF9F2] border-[#F48FB1] text-[#4A2E1B]" : "bg-transparent border-[#EAE0D5] text-[#A89F91] hover:border-[#F48FB1] hover:text-[#4A2E1B]")}
                    >
                      Home Delivery
                    </button>
                    <button 
                      onClick={() => setDeliveryMethod('pickup')}
                      className={cn("py-2 rounded-xl text-xs font-bold transition-colors border", deliveryMethod === 'pickup' ? "bg-[#FFF9F2] border-[#F48FB1] text-[#4A2E1B]" : "bg-transparent border-[#EAE0D5] text-[#A89F91] hover:border-[#F48FB1] hover:text-[#4A2E1B]")}
                    >
                      Store Pickup
                    </button>
                  </div>
                </div>

                {/* Location */}
                <AnimatePresence mode="wait">
                  {deliveryMethod === 'delivery' ? (
                    <motion.div 
                      key="delivery"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 overflow-hidden mt-4"
                    >
                      <label className="text-xs uppercase tracking-widest text-[#8B5E3C] font-bold">Delivery Location</label>
                      <input 
                        type="text" 
                        placeholder="Enter your address..."
                        className="w-full bg-[#FFF9F2] border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F48FB1] transition-colors mt-1"
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="pickup"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 overflow-hidden mt-4"
                    >
                      <label className="text-xs uppercase tracking-widest text-[#8B5E3C] font-bold">Pickup Location</label>
                      <div className="w-full bg-[#FFF9F2] border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm text-[#4A2E1B] mt-1 leading-relaxed">
                        <span className="font-bold block mb-1">Frezzo The Dessert</span>
                        Bjr Nagar, Tirumala Residency, Prasanth Nagar,<br/>
                        Malkajgiri, Secunderabad, Telangana 500017
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Picture Enable */}
                <div className="flex items-center justify-between p-3 bg-[#FFF9F2] rounded-xl border border-[#EAE0D5] mt-4">
                  <div className="flex items-center gap-2 text-[#8B5E3C]">
                    <span className="text-sm font-semibold">Enable Photo Print</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#EAE0D5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F48FB1]"></div>
                  </label>
                </div>

                {/* Order Options */}
                <div className="space-y-1 mt-4">
                  <label className="text-xs uppercase tracking-widest text-[#8B5E3C] font-bold">Order Options</label>
                  <textarea 
                    placeholder="Special instructions, dietary requirements..."
                    rows={2}
                    className="w-full bg-[#FFF9F2] border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F48FB1] transition-colors resize-none"
                  />
                </div>

                <div className="h-px bg-[#EAE0D5] w-full my-4" />
                <div className="flex justify-between text-lg font-bold text-[#4A2E1B] mb-4">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={() => onCheckout(deliveryMethod)}
                className="w-full bg-[#4A2E1B] text-[#FFF9F2] hover:bg-[#3E2616] transition-colors py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 group"
              >
                Checkout <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
