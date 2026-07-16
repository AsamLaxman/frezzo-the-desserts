import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Plus, Printer, X, Sparkles, ClipboardList, PackageOpen, ChefHat, Truck, CheckCircle2, Store, Bell, Mail, Share } from "lucide-react";
import { OrderHistoryItem, Session, Product } from "../types";
import { useState, useRef, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function DeliveryRoute({ origin, destination, progress }: { origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral, progress: number }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [currentPosition, setCurrentPosition] = useState(origin);

  useEffect(() => {
    if (!routesLib || !map) return;
    
    // Clear previous route
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
            p.setOptions({ strokeColor: '#F48FB1', strokeWeight: 4 });
            p.setMap(map)
        });
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) {
           map.fitBounds(routes[0].viewport, 40);
        }
        
        // Calculate current position on path
        const path = newPolylines[0]?.getPath();
        if (path && path.getLength() > 0) {
            // progress is 66 to 100 for delivery phase. Map it to 0-1.
            const deliveryProgress = Math.min(1, Math.max(0, (progress - 66) / 34));
            
            // This is a simplified interpolation along the path
            const index = Math.floor(deliveryProgress * (path.getLength() - 1));
            const point = path.getAt(index);
            if (point) {
                setCurrentPosition({ lat: point.lat(), lng: point.lng() });
            }
        }
      }
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination, progress]);

  return (
      <AdvancedMarker position={currentPosition}>
        <Pin background="#8B5E3C" glyphColor="#fff" borderColor="#4A2E1B" />
      </AdvancedMarker>
  );
}

function DeliveryMap({ progress }: { progress: number }) {
  if (!hasValidKey) {
    return (
      <div className="bg-[#FFF9F2] p-4 rounded-xl border border-[#EAE0D5] text-center my-4 text-[#4A2E1B]">
        <h4 className="text-xs font-bold mb-1">Google Maps API Key Required</h4>
        <p className="text-[10px] text-[#A89F91] mb-2">To track delivery on the map, add your API key in Settings.</p>
        <p className="text-[10px] text-[#A89F91]">Add <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> to Secrets.</p>
      </div>
    );
  }

  // Dummy locations: Bakery and Customer
  const origin = { lat: 37.7749, lng: -122.4194 }; // SF (Bakery)
  const destination = { lat: 37.7858, lng: -122.4064 }; // Customer

  return (
    <div className="h-40 w-full rounded-xl overflow-hidden my-4 border border-[#EAE0D5] relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={origin}
          defaultZoom={13}
          mapId="FREZZO_DELIVERY_MAP"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{width: '100%', height: '100%'}}
          disableDefaultUI={true}
        >
          <AdvancedMarker position={destination}>
             <Pin background="#4285F4" glyphColor="#fff" />
          </AdvancedMarker>
          <DeliveryRoute origin={origin} destination={destination} progress={progress} />
        </Map>
      </APIProvider>
    </div>
  );
}

function OrderTracker({ orderItem }: { orderItem: OrderHistoryItem }) {
  const [progress, setProgress] = useState(0);
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const elapsed = Date.now() - orderItem.timestamp;
      const totalDuration = 20 * 1000; // 20 seconds total for demo
      const currentProgress = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(currentProgress);
    };
    
    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [orderItem.timestamp]);

  const isPickup = orderItem.deliveryMethod === 'pickup';

  useEffect(() => {
    if (!isPickup && progress > 66 && !hasNotified) {
      setHasNotified(true);
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Frezzo", { body: "Your order is out for delivery! 🚚" });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("Frezzo", { body: "Your order is out for delivery! 🚚" });
            }
          });
        }
      }
    }
  }, [progress, isPickup, hasNotified]);

  let statusText = "Preparing";
  let StatusIcon = PackageOpen;

  if (isPickup) {
    if (progress > 33) {
      statusText = "Ready for Pickup";
      StatusIcon = Store;
    }
    if (progress >= 100) {
      statusText = "Completed";
      StatusIcon = CheckCircle2;
    }
  } else {
    if (progress > 33) {
      statusText = "Baking";
      StatusIcon = ChefHat;
    }
    if (progress > 66) {
      statusText = "Out for Delivery";
      StatusIcon = Truck;
    }
    if (progress >= 100) {
      statusText = "Delivered";
      StatusIcon = CheckCircle2;
    }
  }

  return (
    <div className="bg-white border border-[#EAE0D5] rounded-2xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFF9F2] rounded-full flex items-center justify-center text-[#F48FB1]">
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#A89F91] font-bold">Latest Order</p>
            <h3 className="text-sm font-bold text-[#4A2E1B]">{statusText}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[#4A2E1B]">#{orderItem.id.slice(-6)}</p>
          <p className="text-[10px] text-[#A89F91]">{progress >= 100 ? 'Completed' : 'Estimated: ~3 mins'}</p>
        </div>
      </div>
      
      <div className="relative h-2 bg-[#EAE0D5] rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-[#F48FB1] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 1 }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-[9px] font-bold uppercase tracking-widest text-[#A89F91]">
        <span className={progress >= 0 ? "text-[#F48FB1]" : ""}>Prep</span>
        {isPickup ? (
          <>
            <span className={progress > 33 ? "text-[#F48FB1]" : ""}>Pickup</span>
            <span className={progress >= 100 ? "text-[#F48FB1]" : ""}>Done</span>
          </>
        ) : (
          <>
            <span className={progress > 33 ? "text-[#F48FB1]" : ""}>Bake</span>
            <span className={progress > 66 ? "text-[#F48FB1]" : ""}>Deliver</span>
          </>
        )}
      </div>

      {!isPickup && progress > 66 && progress < 100 && (
          <DeliveryMap progress={progress} />
      )}

      {/* Notifications Simulation */}
      <AnimatePresence>
        {!isPickup && progress > 66 && (
          <motion.div 
             initial={{ opacity: 0, y: 10, height: 0 }}
             animate={{ opacity: 1, y: 0, height: 'auto' }}
             className="mt-4 space-y-2"
          >
            <div className="flex items-center gap-2 text-[10px] text-[#8B5E3C] bg-[#FFF9F2] p-2 rounded-lg border border-[#EAE0D5]">
              <Bell className="w-3 h-3 text-[#F48FB1]" />
              <span><strong>Push:</strong> Your delivery person is on the way!</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#8B5E3C] bg-[#FFF9F2] p-2 rounded-lg border border-[#EAE0D5]">
              <Mail className="w-3 h-3 text-[#F48FB1]" />
              <span><strong>Email:</strong> Receipt and tracking link sent to your mail.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OrdersView({ orderHistory, onAddToCart, onAddCustomToCart, onRateOrder }: { orderHistory: OrderHistoryItem[]; onAddToCart: (product: Product) => void; onAddCustomToCart: (session: Session) => void; onRateOrder?: (orderId: string, rating: number) => void }) {
  const [receiptItem, setReceiptItem] = useState<OrderHistoryItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [orderHistory.length]);

  const handleShareOrder = (historyItem: OrderHistoryItem) => {
    const isCustom = historyItem.cartItem.type === 'custom';
    const title = isCustom && historyItem.cartItem.customSession ? historyItem.cartItem.customSession.title : historyItem.cartItem.product?.title;
    const total = historyItem.cartItem.price * historyItem.cartItem.quantity;
    
    const subject = encodeURIComponent(`Check out my Frezzo order: ${title}`);
    const body = encodeURIComponent(`I just ordered ${title} from Frezzo!\n\nOrder Details:\nItem: ${title}\nQuantity: ${historyItem.cartItem.quantity}\nTotal: $${total.toFixed(2)}\nDelivery Method: ${historyItem.deliveryMethod}\n\nCan't wait to try it!`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth z-10 pt-2 scrollbar-hide pb-24">
      <div className="max-w-2xl mx-auto flex flex-col min-h-full">
        <h2 style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }} className="text-2xl font-bold tracking-tight text-[#4A2E1B] mb-6 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Your Orders
        </h2>

        {orderHistory.length > 0 && (
          <OrderTracker orderItem={orderHistory[0]} />
        )}

        {orderHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <ClipboardList className="w-12 h-12 text-[#8B5E3C] mb-4" />
            <p className="text-sm font-semibold text-[#8B5E3C]">No orders yet.</p>
            <p className="text-xs text-[#8B5E3C] mt-1 max-w-[200px]">Place an order to see it here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {orderHistory.map((historyItem, i) => {
              const isCustom = historyItem.cartItem.type === 'custom';
              const title = isCustom && historyItem.cartItem.customSession ? historyItem.cartItem.customSession.title : historyItem.cartItem.product?.title;
              const imageUrl = isCustom && historyItem.cartItem.customSession ? historyItem.cartItem.customSession.imageUrl : historyItem.cartItem.product?.imageUrl;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={historyItem.id}
                  className="bg-white border border-[#EAE0D5] rounded-2xl overflow-hidden flex shadow-sm group hover:border-[#F48FB1] transition-colors relative col-span-2 p-3 gap-4 items-center"
                >
                  <div className="h-16 w-16 bg-[#EAE0D5] relative overflow-hidden rounded-xl flex-shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#A89F91]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-[#4A2E1B] truncate">{title}</h4>
                      <span className="text-[10px] text-[#A89F91] whitespace-nowrap ml-2">
                        {new Date(historyItem.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#A89F91] mb-1">{isCustom ? 'Custom Dessert' : 'Standard Menu'}</p>
                    {historyItem.deliveryMethod === 'pickup' && historyItem.pickupLocation && (
                      <div className="text-[10px] text-[#8B5E3C] bg-[#FFF9F2] p-2 rounded border border-[#EAE0D5] mb-2">
                        <span className="font-bold block">Pickup Location:</span>
                        {historyItem.pickupLocation}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onRateOrder) onRateOrder(historyItem.id, star);
                          }}
                          className={`focus:outline-none transition-colors ${historyItem.rating && historyItem.rating >= star ? 'text-yellow-400' : 'text-[#EAE0D5] hover:text-yellow-200'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCustom && historyItem.cartItem.customSession) {
                            onAddCustomToCart(historyItem.cartItem.customSession);
                          } else if (!isCustom && historyItem.cartItem.product) {
                            onAddToCart(historyItem.cartItem.product);
                          }
                        }}
                        className="bg-[#FFF9F2] border border-[#EAE0D5] text-[#4A2E1B] py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:border-[#F48FB1] hover:text-[#F48FB1] transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Reorder
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceiptItem(historyItem);
                        }}
                        className="bg-[#FFF9F2] border border-[#EAE0D5] text-[#4A2E1B] py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:border-[#F48FB1] hover:text-[#F48FB1] transition-colors"
                      >
                        <Printer className="w-3 h-3" /> Receipt
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareOrder(historyItem);
                        }}
                        className="bg-[#FFF9F2] border border-[#EAE0D5] text-[#4A2E1B] py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:border-[#F48FB1] hover:text-[#F48FB1] transition-colors"
                      >
                        <Share className="w-3 h-3" /> Share
                      </button>
                      <div className="bg-green-50 border border-green-200 text-green-700 py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 ml-auto">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {receiptItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setReceiptItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white text-black p-8 rounded-none w-full max-w-sm shadow-2xl relative font-mono text-sm max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setReceiptItem(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black no-print"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div id="printable-receipt" className="space-y-6">
                <div className="text-center pb-6 border-b-2 border-dashed border-gray-300">
                  <h2 className="text-2xl font-bold uppercase tracking-widest mb-1">FREZZO</h2>
                  <p className="text-xs text-gray-500">The AI Dessert Studio</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(receiptItem.timestamp).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Order ID: #{receiptItem.id.slice(-6)}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start pb-4 border-b border-dotted border-gray-300">
                    <div className="flex-1 pr-4">
                      <p className="font-bold">
                        1x {receiptItem.cartItem.type === 'custom' && receiptItem.cartItem.customSession ? receiptItem.cartItem.customSession.title : receiptItem.cartItem.product?.title}
                      </p>
                      {receiptItem.cartItem.type === 'custom' && (
                        <p className="text-xs text-gray-500 mt-1">Custom Order</p>
                      )}
                    </div>
                    <p className="font-bold">₹{receiptItem.cartItem.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t-2 border-dashed border-gray-300">
                  <div className="flex justify-between text-xs">
                    <span>Subtotal</span>
                    <span>₹{receiptItem.cartItem.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-black">
                    <span>Total</span>
                    <span>₹{receiptItem.cartItem.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> Payment</span>
                    <span className="font-bold text-green-600">RECEIVED</span>
                  </div>
                  {receiptItem.deliveryMethod === 'pickup' && receiptItem.pickupLocation && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                      <p className="text-xs font-bold mb-1">PICKUP DETAILS:</p>
                      <p className="text-xs text-gray-700">{receiptItem.pickupLocation}</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center pt-8 border-t-2 border-dashed border-gray-300">
                  <p className="text-xs uppercase tracking-widest font-bold mb-2">Thank you for visiting</p>
                  <Barcode />
                </div>
              </div>

              <div className="mt-8 no-print flex justify-center">
                <button
                  onClick={() => {
                    const printContent = document.getElementById('printable-receipt');
                    if (printContent) {
                      const iframe = document.createElement('iframe');
                      iframe.style.display = 'none';
                      document.body.appendChild(iframe);
                      const printWindow = iframe.contentWindow;
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Receipt - Frezzo</title>
                              <style>
                                body { font-family: monospace; padding: 20px; max-width: 400px; margin: 0 auto; color: black; }
                                .text-center { text-align: center; }
                                .flex { display: flex; }
                                .justify-between { justify-content: space-between; }
                                .border-b-2 { border-bottom: 2px dashed #ccc; }
                                .border-t-2 { border-top: 2px dashed #ccc; }
                                .border-b { border-bottom: 1px dotted #ccc; }
                                .border-t { border-top: 1px solid #000; }
                                .pb-6 { padding-bottom: 1.5rem; }
                                .pb-4 { padding-bottom: 1rem; }
                                .pt-2 { padding-top: 0.5rem; }
                                .pt-8 { padding-top: 2rem; }
                                .mt-1 { margin-top: 0.25rem; }
                                .mt-2 { margin-top: 0.5rem; }
                                .mb-1 { margin-bottom: 0.25rem; }
                                .mb-2 { margin-bottom: 0.5rem; }
                                .space-y-6 > * + * { margin-top: 1.5rem; }
                                .space-y-4 > * + * { margin-top: 1rem; }
                                .space-y-2 > * + * { margin-top: 0.5rem; }
                                .text-2xl { font-size: 1.5rem; }
                                .text-lg { font-size: 1.125rem; }
                                .text-xs { font-size: 0.75rem; }
                                .font-bold { font-weight: bold; }
                                .uppercase { text-transform: uppercase; }
                                .tracking-widest { letter-spacing: 0.1em; }
                                .text-gray-500 { color: #6b7280; }
                                .flex-1 { flex: 1; }
                                .pr-4 { padding-right: 1rem; }
                                @media print {
                                  body { padding: 0; max-width: 100%; }
                                }
                              </style>
                            </head>
                            <body onload="window.print(); setTimeout(function(){ window.parent.document.body.removeChild(window.frameElement); }, 500);">
                              ${printContent.innerHTML}
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }
                  }}
                  className="bg-black text-white px-6 py-2 rounded-full font-sans font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Barcode() {
  const lines = Array.from({ length: 40 }).map((_, i) => (
    <div 
      key={i} 
      className="h-10 bg-black" 
      style={{ width: `${Math.random() > 0.5 ? 2 : 1}px`, marginRight: `${Math.random() > 0.5 ? 2 : 1}px` }} 
    />
  ));
  
  return (
    <div className="flex justify-center items-center">
      {lines}
    </div>
  );
}
