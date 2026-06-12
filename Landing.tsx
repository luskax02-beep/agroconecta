import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Send, Tent, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Replace with actual WhatsApp number
const WHATSAPP_NUMBER = "5569993899057"; 

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
};

type MenuSection = {
  id: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
};

const MENU_DATA: MenuSection[] = [
  {
    id: "torta",
    title: "TORTA",
    items: [
      { id: "t1", name: "Frango com Catupiry", price: 12 },
      { id: "t2", name: "Carne", price: 12 },
    ]
  },
  {
    id: "batata",
    title: "PORÇÃO BATATA FRITA",
    subtitle: "500 gramas",
    items: [
      { id: "b1", name: "Batata + Calabresa", price: 23 },
      { id: "b2", name: "Batata Simples", price: 18 },
    ]
  },
  {
    id: "pastel",
    title: "PASTEL",
    subtitle: "SABORES",
    items: [
      { id: "p1", name: "Frango com Catupiry", price: 10 },
      { id: "p2", name: "Presunto e Queijo", price: 10 },
      { id: "p3", name: "Carne", price: 10 },
    ]
  },
  {
    id: "bebidas",
    title: "BEBIDAS",
    items: [
      { id: "d1", name: "Caldo de Cana", price: 7 },
      { id: "d2", name: "Suco de Laranja", price: 9 },
    ]
  }
];

type CartItem = MenuItem & { quantity: number; sectionTitle: string };

export default function Landing() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`;

  const addToCart = (item: MenuItem, sectionTitle: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, sectionTitle }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalCart = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const sendToWhatsApp = () => {
    if (cart.length === 0) return;

    let text = `🔥🌽 *FESTA JUNINA 3B AGROPECUÁRIA* 🌽🔥\n\nOlá, sô! Gostaria de fazer o seguinte pedido pro cardápio junino:\n\n`;
    
    // Group by section
    const grouped = cart.reduce((grp, item) => {
      if (!grp[item.sectionTitle]) grp[item.sectionTitle] = [];
      grp[item.sectionTitle].push(item);
      return grp;
    }, {} as Record<string, CartItem[]>);

    for (const [section, items] of Object.entries(grouped)) {
      text += `*${section}*\n`;
      items.forEach(item => {
        text += `- ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})\n`;
      });
      text += `\n`;
    }

    text += `💰 *Total: ${formatPrice(totalCart)}*\n\n`;
    text += `Por favor, me informe a chave PIX ou opções de pagamento. Retirarei no balcão!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#EDE9DE] text-[#2C3825] font-sans pb-24 selection:bg-[#2C3825] selection:text-[#EDE9DE]">
      {/* Header */}
      <header className="bg-[#2C3825] text-[#EDE9DE] py-6 px-6 sticky top-0 z-40 shadow-md">
        {/* Decorative Top Flags */}
        <div className="absolute top-0 inset-x-0 w-full h-8 overflow-hidden pointer-events-none flex justify-around opacity-40">
           {[...Array(15)].map((_, i) => (
             <svg key={i} width="40" height="50" viewBox="0 0 40 50" className={`transform ${i%2 === 0 ? 'text-[#EDE9DE]' : 'text-[#A5B396]'}`}>
               <polygon points="0,0 40,0 20,40" fill="currentColor" />
             </svg>
           ))}
        </div>
        
        <div className="max-w-3xl mx-auto flex items-center justify-between relative z-10 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 border-2 border-[#EDE9DE] rounded-full flex items-center justify-center flex-shrink-0">
               <Tent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest leading-tight">3B Agropecuária</h1>
              <p className="text-sm font-medium tracking-wider text-[#A5B396]">Arraiá & Cardápio</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#2C3825]">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Banner (Optional visual flair) */}
      <div className="bg-[#A5B396]/20 border-b border-[#2C3825]/10 py-10 px-6 overflow-hidden relative">
         <div className="absolute top-1/2 left-4 transform -translate-y-1/2 opacity-20">
            <Flame className="w-20 h-20 text-[#2C3825]" />
         </div>
         <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-20">
            <Flame className="w-20 h-20 text-[#2C3825]" />
         </div>
         
         <div className="max-w-3xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center justify-center space-x-3 mb-2">
              <Flame className="w-6 h-6 text-[#d97706]" />
              <h2 className="text-3xl md:text-5xl font-black text-[#2C3825] tracking-tighter uppercase font-serif transform -rotate-2">
                Cardápio Junino
              </h2>
              <Flame className="w-6 h-6 text-[#d97706]" />
            </div>
            <p className="mt-2 font-bold text-[#2C3825]/80 uppercase tracking-widest text-sm">Evite filas! Peça pelo celular e retire no balcão.</p>
         </div>
      </div>

      {/* Menu List */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-12">
        {MENU_DATA.map((section) => (
          <section key={section.id} className="relative">
            <div className="mb-6 text-center">
              <h3 className="text-3xl font-black uppercase tracking-tight text-[#2C3825] inline-block relative">
                {section.title}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#2C3825] opacity-20 rounded"></div>
              </h3>
              {section.subtitle && (
                <p className="text-sm font-semibold tracking-widest uppercase text-[#2C3825]/60 mt-2">
                  {section.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {section.items.map((item) => {
                const cartItem = cart.find(i => i.id === item.id);
                
                return (
                  <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#2C3825]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                    <div>
                      <h4 className="text-lg font-bold uppercase text-[#2C3825]">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-[#2C3825]/70 mt-1">{item.description}</p>
                      )}
                      <p className="text-[#2C3825] font-black text-lg mt-2">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex items-center self-start sm:self-auto">
                      {cartItem ? (
                        <div className="flex items-center bg-[#2C3825]/5 rounded-full p-1 border border-[#2C3825]/10">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-[#2C3825] transition-colors shadow-sm">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-bold text-lg">{cartItem.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-[#2C3825] transition-colors shadow-sm">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item, section.title)}
                          className="bg-[#2C3825] hover:bg-[#1f281b] text-[#EDE9DE] px-6 py-2.5 rounded-full font-bold uppercase tracking-wider text-sm flex items-center transition-colors shadow-md"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center py-8 text-[#2C3825]/50 border-t border-[#2C3825]/10 mt-12 mx-4">
         <p className="font-bold uppercase tracking-widest text-sm mb-1">Instituto Federal de Rondônia</p>
         <p className="text-xs uppercase tracking-wider font-medium">Técnico em Agropecuária</p>
      </footer>

      {/* Floating Checkout Button (Mobile mostly) */}
      <AnimatePresence>
        {totalItems > 0 && !isCartOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-30"
          >
            <div className="max-w-md mx-auto">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-[#2C3825] text-white rounded-full p-4 flex items-center justify-between shadow-xl shadow-[#2C3825]/30 transform active:scale-[0.98] transition-all"
              >
                <div className="flex items-center font-bold">
                  <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    {totalItems}
                  </div>
                  Ver Pedido
                </div>
                <div className="font-black text-lg">
                  {formatPrice(totalCart)}
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal / Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-[#2C3825]/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] h-full bg-white rounded-t-[2rem] z-50 shadow-2xl flex flex-col md:max-w-md md:mx-auto md:relative md:h-auto md:max-h-[80vh] md:rounded-2xl md:mt-20 overflow-hidden"
            >
              <div className="p-6 border-b border-[#2C3825]/10 flex items-center justify-between bg-white shrink-0">
                <h3 className="text-2xl font-black uppercase text-[#2C3825]">Meu Pedido</h3>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#2C3825] transition-colors"
                >
                  <Plus className="w-6 h-6 transform rotate-45" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-[#F9F9F9]">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#2C3825]/50 py-10">
                    <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-medium text-lg uppercase">Carrinho Vazio</p>
                    <p className="text-sm">Bora encher o bucho, sô!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 items-center">
                         <div className="flex-1">
                           <p className="text-[10px] font-bold text-[#2C3825]/50 uppercase tracking-wider">{item.sectionTitle}</p>
                           <h5 className="font-bold text-[#2C3825] uppercase text-sm">{item.name}</h5>
                           <p className="text-[#2C3825] font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                         </div>
                         <div className="flex items-center flex-shrink-0 bg-white border border-[#2C3825]/10 rounded-full shadow-sm">
                           <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-[#2C3825]">
                             {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                           </button>
                           <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-[#2C3825]">
                             <Plus className="w-3.5 h-3.5" />
                           </button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-[#2C3825]/10 shrink-0">
                  <div className="flex items-center justify-between mb-6">
                     <span className="text-lg font-bold text-[#2C3825] uppercase">Total</span>
                     <span className="text-2xl font-black text-[#2C3825]">{formatPrice(totalCart)}</span>
                  </div>
                  <button 
                    onClick={sendToWhatsApp}
                    className="w-full bg-[#1b5e20] hover:bg-[#144317] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center transition-colors shadow-lg shadow-[#1b5e20]/30"
                  >
                    <Send className="w-4 h-4 mr-3" />
                    Enviar Pedido por WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

