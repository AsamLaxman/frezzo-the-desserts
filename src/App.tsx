import { useState, useRef, useEffect, ReactNode } from "react";
import { CakeSlice, ShoppingBag, Store, Search, User, Share2, Instagram, Twitter, Link2, X, ArrowRight, ArrowLeft, LogOut, Pause, Play, Heart, ClipboardList, Home, Download, ImageIcon, Check, ChevronDown, ChevronUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from 'html-to-image';
import { cn } from "./lib/utils";
import { Message, Session, CartItem, Product, OrderHistoryItem } from "./types";
import { LoadingPage } from "./LoadingPage";
import { LoginPage } from "./LoginPage";
import { ShopView } from "./components/ShopView";
import { CartView } from "./components/CartView";
import { OrdersView } from "./components/OrdersView";
import { HomeView } from "./components/HomeView";
import { ProfileView } from "./components/ProfileView";

import { Confetti } from "./components/Confetti";
import { playNotificationSound } from "./lib/audio";

function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EAE0D5] flex items-center justify-center p-0 sm:p-6 w-full font-sans">
      <div className="flex flex-col h-[100dvh] sm:h-[844px] w-full sm:w-[390px] bg-[#FFF9F2] text-[#4A2E1B] relative overflow-hidden sm:rounded-[3rem] sm:shadow-2xl sm:border-[8px] border-white sm:ring-1 sm:ring-[#4A2E1B]/10 flex-shrink-0">
        {children}
      </div>
    </div>
  );
}

const vibrate = (pattern: number | number[] = 50) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const isAdmin = loggedInEmail?.toLowerCase() === "asamlaxman2003@gmail.com" || 
    (loggedInEmail && ["9346122148", "919346122148", "+919346122148"].includes(loggedInEmail.replace(/[^0-9]/g, "")));
  const [currentTab, setCurrentTab] = useState<'home' | 'shop' | 'cart' | 'orders' | 'profile'>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedDesserts, setSavedDesserts] = useState<Session[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('frezzo_order_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [checkoutSuccess, setCheckoutSuccess] = useState<{show: boolean, deliveryMethod: 'delivery' | 'pickup' | null}>({show: false, deliveryMethod: null});

  useEffect(() => {
    localStorage.setItem('frezzo_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const previewData = params.get('preview');
    if (previewData) {
      try {
        const decoded = JSON.parse(atob(previewData));
        if (decoded && decoded.id && decoded.title) {
          setActiveSession(decoded);
        }
      } catch (err) {
        console.error("Failed to parse preview link:", err);
      }
    }
  }, []);
  
  const handleToggleFavorite = (session: Session) => {
    vibrate(50);
    setSavedDesserts(prev => {
      const isSaved = prev.some(s => s.id === session.id);
      if (isSaved) {
        return prev.filter(s => s.id !== session.id);
      } else {
        return [...prev, session];
      }
    });
  };
  
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", parts: [{ text: "Are you in the mood for something rich and chocolatey, or perhaps bright and fruity today?" }] }
  ]);
  
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleLogin = (email: string) => {
    setLoggedInEmail(email);
    setIsLoggedIn(true);
  };

  const handleAddToCart = (product: Product) => {
    vibrate([50, 100, 50]);
    const newItem: CartItem = { id: Date.now().toString(), product, quantity: 1, type: 'standard', price: product.price };
    setCartItems(prev => {
      const existing = prev.find(item => item.product?.id === product.id);
      if (existing) {
        return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, newItem];
    });
    setConfettiTrigger(prev => prev + 1);
  };

  const handleAddCustomToCart = (session: Session) => {
    vibrate([50, 100, 50]);
    const newItem: CartItem = { 
      id: Date.now().toString(), 
      customSession: session, 
      quantity: 1, 
      type: 'custom', 
      price: 85 
    };
    setCartItems(prev => [...prev, newItem]);
    setConfettiTrigger(prev => prev + 1);
    setActiveSession(null);
  };

  const handleRemoveFromCart = (id: string) => {
    vibrate(50);
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSetCurrentTab = (tab: 'home' | 'shop' | 'cart' | 'orders' | 'profile') => {
    vibrate(30);
    setCurrentTab(tab);
  };

  const handleCheckout = (deliveryMethod: 'delivery' | 'pickup') => {
    if (cartItems.length === 0) return;
    
    const newOrders = cartItems.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      cartItem: item,
      timestamp: Date.now(),
      deliveryMethod,
      pickupLocation: deliveryMethod === 'pickup' ? 'Bjr Nagar, Tirumala Residency, Prasanth Nagar, Malkajgiri, Secunderabad, Telangana 500017' : undefined
    }));
    
    setOrderHistory(prev => [...newOrders, ...prev]);
    setCartItems([]);
    setCheckoutSuccess({ show: true, deliveryMethod });
  };

  const closeCheckoutSuccess = () => {
    setCheckoutSuccess({ show: false, deliveryMethod: null });
    handleSetCurrentTab('orders');
  };

  const handleRateOrder = (orderId: string, rating: number) => {
    setOrderHistory(prev => prev.map(order => 
      order.id === orderId ? { ...order, rating } : order
    ));
  };

  const handleGenerateSession = async (queryStr: string, activeFilter?: string | null) => {
    if (!queryStr && !activeFilter) return;

    setIsGeneratingSession(true);
    try {
      const currentMessages = [...messages];
      
      let userText = "";
      if (queryStr) userText = queryStr;
      if (activeFilter) {
        userText += (userText ? " and " : "I'm feeling like something ") + `${activeFilter.toLowerCase()} today.`;
      }
      
      if (userText) {
        const userMsg = { role: "user" as const, parts: [{ text: userText }] };
        currentMessages.push(userMsg);
        setMessages(currentMessages);
      }
      
      if (queryStr && !recentSearches.includes(queryStr)) {
        setRecentSearches(prev => [queryStr, ...prev].slice(0, 3));
      }

      setLoadingStep("Baking your custom dessert concept...");
      const designRes = await fetch("/api/design-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages })
      });
      const design = await designRes.json();

      setLoadingStep("Synthesizing description and plating visuals...");
      
      const audioPromise = fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: design.script })
      }).then(r => r.json());

      const imagePromise = fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: design.imagePrompt + ` High quality, 2K resolution.`,
          size: "2K"
        })
      }).then(r => r.json());

      const [audioData, imageData] = await Promise.all([audioPromise, imagePromise]);

      const session: Session = {
        id: Date.now().toString(),
        title: design.title,
        script: design.script,
        flavorProfiles: design.flavorProfiles,
        ingredients: design.ingredients,
        audioUrl: audioData.audioBase64 ? `data:${audioData.mimeType};base64,${audioData.audioBase64}` : undefined,
        imageUrl: imageData.imageBase64 ? `data:image/jpeg;base64,${imageData.imageBase64}` : undefined
      };

      setLoadingStep("Serving your creation...");
      await new Promise(r => setTimeout(r, 800));
      setActiveSession(session);

    } catch (err) {
      console.error(err);
      alert("Failed to generate dessert. Please try again.");
    } finally {
      setIsGeneratingSession(false);
      setLoadingStep("");
    }
  };

  const handleToggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    if (newState) {
      playNotificationSound();
    }
  };

  if (!isLoggedIn) {
    return (
      <MobileFrame>
        <LoginPage onLogin={handleLogin} />
      </MobileFrame>
    );
  }

  if (isGeneratingSession) {
    return (
      <MobileFrame>
        <LoadingPage step={loadingStep} />
      </MobileFrame>
    );
  }

  if (activeSession) {
    return (
      <MobileFrame>
        <SessionView 
          session={activeSession} 
          onClose={() => setActiveSession(null)} 
          onOrder={() => handleAddCustomToCart(activeSession)}
          isFavorite={savedDesserts.some(s => s.id === activeSession.id)}
          onToggleFavorite={() => handleToggleFavorite(activeSession)}
        />
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Confetti trigger={confettiTrigger} />
      <div className="flex flex-col h-full bg-[#FFF9F2] text-[#4A2E1B] font-sans relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#F8BBD0]/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#D7CCC8]/30 rounded-full blur-[120px]"></div>
        </div>

        <header className="flex items-center justify-between px-6 py-6 z-20 bg-[#FFF9F2]/80 backdrop-blur-md sticky top-0 border-b border-[#EAE0D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A2E1B] flex items-center justify-center">
               <CakeSlice className="w-5 h-5 text-[#FFF9F2]" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }} className="text-xl font-bold tracking-tight text-[#4A2E1B]">Frezzo</h1>
              <p className="text-[8px] tracking-[0.2em] uppercase font-semibold text-[#8B5E3C]">The Desserts</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full border border-[#EAE0D5] flex items-center justify-center text-[#4A2E1B] hover:bg-[#EAE0D5] transition-colors">
            <User className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-hidden relative flex flex-col">
          {currentTab === 'home' && (
            <HomeView 
              onGoToShop={() => handleSetCurrentTab('shop')} 
              onAddToCart={handleAddToCart}
              savedDesserts={savedDesserts}
              onViewSession={(session) => setActiveSession(session)}
            />
          )}
          {currentTab === 'shop' && (
            <ShopView 
              onAddToCart={handleAddToCart} 
              savedDesserts={savedDesserts}
              onViewSession={(session) => setActiveSession(session)}
              onAddCustomToCart={handleAddCustomToCart}
              onRemoveSavedDessert={handleToggleFavorite}
            />
          )}
          {currentTab === 'cart' && (
            <CartView cartItems={cartItems} onRemoveItem={handleRemoveFromCart} onCheckout={handleCheckout} />
          )}
          {currentTab === 'orders' && (
            <OrdersView orderHistory={orderHistory} onAddToCart={handleAddToCart} onAddCustomToCart={handleAddCustomToCart} onRateOrder={handleRateOrder} />
          )}
          {currentTab === 'profile' && (
            <ProfileView 
              onLogout={() => setIsLoggedIn(false)} 
              isAdmin={isAdmin} 
              userEmail={loggedInEmail || ''}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={handleToggleNotifications}
            />
          )}
        </main>

        <nav className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-[#EAE0D5] pb-safe z-50">
          <div className="flex justify-around items-center p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <button 
              onClick={() => handleSetCurrentTab('home')} 
              className={cn("flex flex-col items-center gap-1 transition-colors", currentTab === 'home' ? "text-[#F48FB1]" : "text-[#A89F91] hover:text-[#8B5E3C]")}
            >
              <Home className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
            </button>
            <button 
              onClick={() => handleSetCurrentTab('shop')} 
              className={cn("flex flex-col items-center gap-1 transition-colors", currentTab === 'shop' ? "text-[#F48FB1]" : "text-[#A89F91] hover:text-[#8B5E3C]")}
            >
              <Store className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Shop</span>
            </button>
            <button 
              onClick={() => handleSetCurrentTab('orders')} 
              className={cn("flex flex-col items-center gap-1 transition-colors", currentTab === 'orders' ? "text-[#F48FB1]" : "text-[#A89F91] hover:text-[#8B5E3C]")}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Orders</span>
            </button>
            <button 
              onClick={() => handleSetCurrentTab('cart')} 
              className={cn("flex flex-col items-center gap-1 transition-colors relative", currentTab === 'cart' ? "text-[#F48FB1]" : "text-[#A89F91] hover:text-[#8B5E3C]")}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#F48FB1] text-white rounded-full text-[8px] font-bold flex items-center justify-center border border-white">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            <button 
              onClick={() => handleSetCurrentTab('profile')} 
              className={cn("flex flex-col items-center gap-1 transition-colors", currentTab === 'profile' ? "text-[#F48FB1]" : "text-[#A89F91] hover:text-[#8B5E3C]")}
            >
              <User className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
            </button>
          </div>
        </nav>
        
        <AnimatePresence>
          {checkoutSuccess.show && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#FFF9F2] rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <Check className="w-10 h-10 text-green-600" />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-black text-[#2C1810] tracking-widest uppercase mb-2">Order Confirmed!</h2>
                <p className="text-[#8B5E3C] text-sm mb-6">
                  Thank you for shopping at Frezzo.
                </p>
                
                {checkoutSuccess.deliveryMethod === 'pickup' && (
                  <div className="bg-[#EBE3DB] rounded-2xl p-4 w-full mb-6 border border-[#EAE0D5] text-left">
                    <p className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-bold mb-1">Pickup Location</p>
                    <p className="text-sm font-bold text-[#4A2E1B]">Frezzo The Dessert</p>
                    <p className="text-xs text-[#4A2E1B] leading-relaxed mt-1">Bjr Nagar, Tirumala Residency, Prasanth Nagar, Malkajgiri, Secunderabad, Telangana 500017</p>
                  </div>
                )}

                <button
                  onClick={closeCheckoutSuccess}
                  className="w-full bg-[#4A2E1B] text-[#FFF9F2] hover:bg-[#3E2616] transition-colors py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg"
                >
                  View Orders
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MobileFrame>
  );
}

function SessionView({ session, onClose, onOrder, isFavorite, onToggleFavorite }: { session: Session; onClose: () => void; onOrder: () => void; isFavorite?: boolean; onToggleFavorite?: () => void; }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [imageFilter, setImageFilter] = useState<'Normal' | 'Sepia' | 'Black & White' | 'Vibrant'>('Normal');
  const [sweetness, setSweetness] = useState(3);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const getNutritionInfo = (ingredients: string[] | undefined) => {
    if (!ingredients || ingredients.length === 0) return null;
    
    let calories = 150; // base calories
    const allergens = new Set<string>();
    
    ingredients.forEach(i => {
      const lower = i.toLowerCase();
      calories += 40;
      if (lower.includes('chocolate') || lower.includes('sugar') || lower.includes('caramel') || lower.includes('syrup')) calories += 70;
      if (lower.includes('cream') || lower.includes('milk') || lower.includes('cheese') || lower.includes('butter') || lower.includes('yogurt') || lower.includes('dairy')) allergens.add('Contains Dairy');
      if (lower.includes('flour') || lower.includes('wheat') || lower.includes('cookie') || lower.includes('cake') || lower.includes('pastry') || lower.includes('biscuit') || lower.includes('graham') || lower.includes('dough')) allergens.add('Contains Gluten');
      if (lower.includes('nut') || lower.includes('almond') || lower.includes('pecan') || lower.includes('walnut') || lower.includes('pistachio') || lower.includes('peanut') || lower.includes('cashew') || lower.includes('hazelnut')) allergens.add('Contains Nuts');
      if (lower.includes('egg')) allergens.add('Contains Eggs');
      if (lower.includes('soy')) allergens.add('Contains Soy');
    });

    if (!allergens.has('Contains Gluten')) allergens.add('Gluten-Free');
    
    return {
      calories: calories + (sweetness * 25),
      allergens: Array.from(allergens)
    };
  };

  const nutritionInfo = getNutritionInfo(session.ingredients);

  const togglePlay = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCopyLink = async () => {
    try {
      const base64Session = btoa(JSON.stringify(session));
      const url = new URL(window.location.href);
      url.searchParams.set('preview', base64Session);
      await navigator.clipboard.writeText(url.toString());
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleDownloadConcept = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${session.title.replace(/\s+/g, '_').toLowerCase()}_concept.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getFilterClass = () => {
    switch(imageFilter) {
      case 'Sepia': return 'sepia-[.7] contrast-110';
      case 'Black & White': return 'grayscale contrast-125';
      case 'Vibrant': return 'saturate-200 contrast-110';
      default: return '';
    }
  };

  const getSweetnessModifier = () => {
    switch(sweetness) {
      case 1: return "Mildly Sweet ";
      case 2: return "Lightly Sweet ";
      case 3: return "";
      case 4: return "Very Sweet ";
      case 5: return "Extremely Sweet ";
      default: return "";
    }
  };

  const displayTitle = getSweetnessModifier() + session.title;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex-1 w-full h-full bg-[#FFF9F2] text-[#4A2E1B] overflow-hidden flex flex-col font-sans relative"
    >
      <div className="absolute inset-0 z-0 bg-white">
        {session.imageUrl && (
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ 
              scale: 1.05, 
              opacity: 1,
              y: ["-1%", "1%", "-1%"]
            }}
            transition={{ 
              scale: { duration: 1, ease: "easeOut" },
              opacity: { duration: 1, ease: "easeOut" },
              y: { duration: 6, ease: "easeInOut", repeat: Infinity }
            }}
            src={session.imageUrl} 
            alt="Dessert Creation" 
            className={`w-full h-full object-cover transition-all duration-700 ${getFilterClass()}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#4A2E1B]/90 via-[#4A2E1B]/40 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <header className="px-6 py-6 flex justify-between items-center text-white drop-shadow-md">
          <div className="flex items-center gap-2">
            <CakeSlice className="w-4 h-4 text-[#F48FB1]" />
            <span className="text-xs tracking-[0.3em] font-bold uppercase">Frezzo Collection</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleFavorite} 
              className={cn("p-2 transition-colors rounded-full backdrop-blur-sm bg-black/20", isFavorite ? "text-[#F48FB1]" : "text-white hover:text-[#F48FB1]")}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-end p-6 pb-12 text-white">
          <div className="max-w-2xl">
            <motion.p
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-[10px] uppercase tracking-[0.3em] text-[#F48FB1] font-bold mb-3"
            >
              Signature Creation
            </motion.p>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }}
              className="text-4xl font-bold tracking-tight mb-4 leading-[1.1]"
            >
              {displayTitle}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-2 mb-4"
            >
              {(['Normal', 'Sepia', 'Black & White', 'Vibrant'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setImageFilter(filter)}
                  className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full transition-colors ${imageFilter === filter ? 'bg-white text-[#4A2E1B]' : 'bg-black/20 text-white/80 hover:bg-black/40'}`}
                >
                  {filter}
                </button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36 }}
              className="mb-4 max-w-[200px]"
            >
              <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold mb-2">
                <span className="text-white/80">Sweetness</span>
                <span className="text-[#F48FB1]">{sweetness}/5</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={sweetness} 
                onChange={(e) => setSweetness(Number(e.target.value))}
                className="w-full accent-[#F48FB1] bg-white/20 h-1.5 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#F48FB1] [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
              />
            </motion.div>

            {session.flavorProfiles && session.flavorProfiles.length > 0 && (
              <motion.div
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.35 }}
                 className="flex flex-wrap items-center gap-2 mb-3"
              >
                {session.flavorProfiles.map((flavor, index) => (
                  <motion.span 
                    key={index} 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + (index * 0.1), type: "spring", stiffness: 300, damping: 15 }}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm"
                  >
                    {flavor}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {session.ingredients && session.ingredients.length > 0 && (
              <motion.div
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.38 }}
                 className="flex flex-wrap items-center gap-2 mb-4"
              >
                <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold mr-1">Ingredients:</span>
                {session.ingredients.map((ingredient, index) => (
                  <span key={index} className="bg-[#4A2E1B]/60 backdrop-blur-sm border border-[#4A2E1B]/80 text-[#FFF9F2] px-2.5 py-0.5 rounded-md text-[10px] font-medium shadow-sm">
                    {ingredient}
                  </span>
                ))}
              </motion.div>
            )}
            
            {nutritionInfo && (
              <motion.div
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.39 }}
                 className="mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setIsNutritionOpen(!isNutritionOpen)}
                  className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#F48FB1]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Nutrition & Allergens</span>
                  </div>
                  {isNutritionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {isNutritionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 border-t border-white/10"
                    >
                      <div className="flex flex-col gap-3 mt-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/70 font-medium">Estimated Calories</span>
                          <span className="font-bold text-white">{nutritionInfo.calories} kcal</span>
                        </div>
                        <div>
                          <span className="text-white/70 font-medium text-xs mb-2 block">Dietary Info</span>
                          <div className="flex flex-wrap gap-2">
                            {nutritionInfo.allergens.map((allergen, idx) => (
                              <span key={idx} className={cn("px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase", allergen === 'Gluten-Free' ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-orange-500/20 text-orange-200 border border-orange-500/30')}>
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            
            <motion.div
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="flex items-center gap-4"
            >
              <button
                onClick={togglePlay}
                className="w-16 h-16 shrink-0 bg-[#F48FB1] hover:bg-[#F06292] rounded-full flex items-center justify-center text-white transition-transform transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
              </button>
              <div className="text-sm opacity-90 max-w-md font-medium leading-relaxed">
                 <span className="text-[#F48FB1] font-bold mr-2">Listen:</span>
                 Hear the description of your custom dessert masterpiece.
              </div>
            </motion.div>

            <motion.div
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="mt-6 flex flex-col gap-3"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">Total Price</p>
                  <p className="text-xl font-bold tracking-tight text-white">₹85.00</p>
                </div>
                <button 
                  onClick={() => onOrder()}
                  className="bg-[#FFF9F2] text-[#4A2E1B] hover:bg-[#F48FB1] hover:text-white transition-colors px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsShareOpen(true)}
                  className="bg-transparent border border-white/30 hover:bg-white/10 text-white transition-colors p-3 rounded-full flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDownloadConcept}
                  disabled={isDownloading}
                  className="bg-transparent border border-white/30 hover:bg-white/10 text-white transition-colors p-3 rounded-full flex items-center justify-center gap-2"
                >
                  <Download className={cn("w-4 h-4", isDownloading && "opacity-50 animate-pulse")} />
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 bg-transparent border border-white/30 hover:bg-white/10 text-white transition-colors px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Back
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {session.audioUrl && (
        <audio 
          ref={audioRef} 
          src={session.audioUrl} 
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      {/* Hidden Card for Image Generation */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div ref={cardRef} className="w-[400px] bg-[#FFF9F2] pb-6 font-sans text-[#4A2E1B] overflow-hidden">
          <div className="relative w-full h-[400px]">
            {session.imageUrl && (
              <img src={session.imageUrl} className={`w-full h-full object-cover ${getFilterClass()}`} crossOrigin="anonymous" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#4A2E1B] to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
               <p className="text-[10px] uppercase tracking-[0.3em] text-[#F48FB1] font-bold mb-1">Signature Creation</p>
               <h2 style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }} className="text-3xl font-bold tracking-tight leading-[1.1]">{displayTitle}</h2>
            </div>
          </div>
          <div className="p-6">
            {session.flavorProfiles && session.flavorProfiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {session.flavorProfiles.map((flavor, index) => (
                  <span key={index} className="bg-[#EAE0D5] text-[#4A2E1B] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {flavor}
                  </span>
                ))}
              </div>
            )}
            {session.ingredients && session.ingredients.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-bold mr-1">Ingredients:</span>
                {session.ingredients.map((ingredient, index) => (
                  <span key={index} className="bg-white border border-[#EAE0D5] text-[#4A2E1B] px-2.5 py-0.5 rounded-md text-[10px] font-medium">
                    {ingredient}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-[#EAE0D5] flex items-center gap-2 justify-center">
              <CakeSlice className="w-4 h-4 text-[#F48FB1]" />
              <span className="text-[10px] uppercase tracking-widest text-[#A89F91] font-bold">Frezzo The Desserts</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isShareOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareOpen(false)}
              className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 w-full bg-[#FFF9F2] rounded-t-3xl z-50 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-[#EAE0D5] rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#4A2E1B] tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }}>Share your creation</h3>
                <button onClick={() => setIsShareOpen(false)} className="p-2 text-[#8B5E3C] hover:bg-[#EAE0D5] rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button className="flex flex-col items-center gap-3 group">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md transform group-hover:scale-105 transition-transform">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5E3C]">Story</span>
                </button>
                <button className="flex flex-col items-center gap-3 group">
                  <div className="w-14 h-14 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white shadow-md transform group-hover:scale-105 transition-transform">
                    <Twitter className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5E3C]">Tweet</span>
                </button>
                <button onClick={handleCopyLink} className="flex flex-col items-center gap-3 group">
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shadow-sm transform group-hover:scale-105 transition-all", copyStatus === 'copied' ? "bg-[#4A2E1B] text-white" : "bg-[#EAE0D5] text-[#4A2E1B]")}>
                    {copyStatus === 'copied' ? <Check className="w-6 h-6" /> : <Link2 className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5E3C]">
                    {copyStatus === 'copied' ? 'Copied' : 'Copy'}
                  </span>
                </button>
                <button className="flex flex-col items-center gap-3 group">
                  <div className="w-14 h-14 rounded-full bg-[#F48FB1] flex items-center justify-center text-white shadow-md transform group-hover:scale-105 transition-transform">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5E3C]">More</span>
                </button>
              </div>
              
              <div className="bg-white border border-[#EAE0D5] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#EAE0D5] overflow-hidden shrink-0">
                  {session.imageUrl && (
                    <img src={session.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#4A2E1B] truncate">{session.title}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#8B5E3C] truncate">Frezzo Collection</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
