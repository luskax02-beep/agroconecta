import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, X, Plus, Minus, Tent, Flame, Leaf, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA ---
type Flavor = string;
type MenuItem = {
  id: string;
  name: string;
  category: string;
  description?: string;
  flavors?: Flavor[];
  price: number;
};

const MENU: MenuItem[] = [
  {
    id: 'torta-frango',
    name: 'Torta',
    category: 'Salgados',
    flavors: ['Frango com Catupiry', 'Carne'],
    price: 12.00,
  },
  {
    id: 'batata-calabresa',
    name: 'Batata Frita + Calabresa',
    description: 'Porção 500g',
    category: 'Porções',
    price: 23.00,
  },
  {
    id: 'batata-simples',
    name: 'Batata Frita Simples',
    description: 'Porção 500g',
    category: 'Porções',
    price: 18.00,
  },
  {
    id: 'pastel',
    name: 'Pastel',
    category: 'Salgados',
    flavors: ['Frango com Catupiry', 'Presunto e Queijo', 'Carne'],
    price: 10.00,
  },
  {
    id: 'caldo-de-cana',
    name: 'Caldo de Cana',
    category: 'Bebidas',
    price: 7.00,
  },
  {
    id: 'suco-laranja',
    name: 'Suco de Laranja',
    category: 'Bebidas',
    price: 9.00,
  },
];

type CartItem = {
  cartItemId: string;
  menuItem: MenuItem;
  flavor?: string;
  quantity: number;
};

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [orderPlaced, setOrderPlaced] = useState<{ id: string; total: number; items: CartItem[] } | null>(null);

  const openFlavorModal = (item: MenuItem) => {
    if (item.flavors && item.flavors.length > 0) {
      setSelectedItem(item);
      setSelectedFlavor(item.flavors[0]);
    } else {
      addToCart(item);
    }
  };

  const addToCart = (item: MenuItem, flavor?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.menuItem.id === item.id && c.flavor === flavor
      );
      if (existing) {
        return prev.map((c) =>
          c.cartItemId === existing.cartItemId
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          cartItemId: Math.random().toString(36).substring(7),
          menuItem: item,
          flavor,
          quantity: 1,
        },
      ];
    });
    setSelectedItem(null);
    setSelectedFlavor('');
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.cartItemId === cartItemId) {
          const newQ = c.quantity + delta;
          return { ...c, quantity: newQ > 0 ? newQ : 0 };
        }
        return c;
      }).filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.menuItem.price * curr.quantity, 0);
  const cartItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const checkout = () => {
    if (cart.length === 0) return;
    const orderId = Math.random().toString(36).substring(2, 6).toUpperCase();
    setOrderPlaced({
      id: orderId,
      total: cartTotal,
      items: [...cart],
    });
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#e8e4d3] text-[#3e4f32] font-sans pb-24">
      {/* HEADER DECORATION */}
      <div className="w-full h-24 bg-[#3e4f32] overflow-hidden relative flex items-center justify-center">
        {/* Bandeirinhas decoration */}
        <div className="absolute top-0 w-full flex justify-around">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`w-8 h-12 ${i % 2 === 0 ? 'bg-[#ffeb84]' : 'bg-[#e26d5a]'} -mt-4 transform rotate-12 flex-shrink-0 clip-path-flag`}></div>
          ))}
        </div>
        <h1 className="text-[#e8e4d3] text-3xl font-black uppercase tracking-widest relative z-10 flex items-center gap-3">
          <Flame className="w-6 h-6 text-[#ffeb84]" />
          3B Agropecuária
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h2 className="text-4xl font-black uppercase text-[#3e4f32] tracking-tighter mb-2">Cardápio</h2>
          <p className="text-lg text-[#5a6e4a] font-medium">Festa Junina • Instituto Federal Rondônia</p>
          <p className="text-sm text-[#7a8a6d] mt-2 bg-[#d7ceb8] inline-block px-4 py-1 rounded-full">Faça seu pedido online e pule a fila do caixa!</p>
        </header>

        {/* MENU LIST */}
        <div className="space-y-6">
          {menusByCategory(MENU).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-2xl font-bold uppercase tracking-wide border-b-2 border-[#81946f] pb-2 mb-4 flex items-center gap-2">
                {category === 'Salgados' ? <Utensils className="w-6 h-6" /> : category === 'Bebidas' ? <Tent className="w-6 h-6" /> : <Leaf className="w-6 h-6" />}
                {category}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    key={item.id}
                    onClick={() => openFlavorModal(item)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-[#d7ceb8] cursor-pointer flex justify-between items-center group hover:border-[#3e4f32] hover:shadow-md transition-all"
                  >
                    <div>
                      <h4 className="text-xl font-bold text-[#3e4f32] uppercase">{item.name}</h4>
                      {item.description && <p className="text-sm text-[#7a8a6d] font-medium">{item.description}</p>}
                      {item.flavors && (
                        <p className="text-xs text-[#7a8a6d] mt-1 italic">
                          Opções: {item.flavors.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-[#e26d5a]">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                      <div className="w-10 h-10 bg-[#3e4f32] text-white rounded-full flex items-center justify-center group-hover:bg-[#5a6e4a] transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLAVOR SELECTION MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="bg-[#f2efe4] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="bg-[#3e4f32] p-4 flex justify-between items-center text-white">
                <h3 className="text-xl font-bold uppercase tracking-wider">{selectedItem.name}</h3>
                <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <p className="font-bold text-[#5a6e4a] mb-4 text-center uppercase tracking-widest text-sm">Escolha o Sabor</p>
                <div className="space-y-3">
                  {selectedItem.flavors?.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`w-full p-4 rounded-xl font-bold text-left transition-all border-2 ${selectedFlavor === flavor ? 'bg-[#3e4f32] text-white border-[#3e4f32]' : 'bg-white text-[#3e4f32] border-[#d7ceb8] hover:border-[#81946f]'}`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => addToCart(selectedItem, selectedFlavor)}
                  className="w-full mt-6 bg-[#e26d5a] text-white font-bold uppercase tracking-wider p-4 rounded-xl shadow-lg hover:bg-[#c95b4a] active:scale-95 transition-all"
                >
                  Adicionar ao Pedido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING CART BUTTON */}
      <AnimatePresence>
        {cartItemCount > 0 && !isCartOpen && !orderPlaced && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-0 right-0 px-4 z-40 max-w-2xl mx-auto"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#3e4f32] text-white rounded-2xl p-4 shadow-2xl flex justify-between items-center hover:bg-[#2b3821] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 bg-[#e26d5a] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                </div>
                <span className="font-bold uppercase tracking-wider">Ver seu Pedido</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART OVERLAY */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-[#e8e4d3] flex flex-col">
            <div className="p-4 bg-[#3e4f32] text-white flex justify-between items-center shadow-md">
              <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Seu Pedido
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 active:scale-95">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item) => (
                <div key={item.cartItemId} className="bg-white p-4 rounded-2xl shadow-sm border border-[#d7ceb8] flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-bold text-[#3e4f32] uppercase">{item.menuItem.name}</h4>
                    {item.flavor && <p className="text-sm text-[#7a8a6d]">{item.flavor}</p>}
                    <p className="text-[#e26d5a] font-bold">R$ {item.menuItem.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-[#e8e4d3] p-1 rounded-xl">
                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-[#3e4f32] shadow-sm active:scale-95">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-4 text-center text-[#3e4f32]">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#3e4f32] text-white shadow-sm active:scale-95">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-20 text-[#7a8a6d]">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-lg uppercase tracking-wider">Sua sacola está vazia</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-white border-t border-[#d7ceb8] shadow-lg pb-safe">
                <div className="flex justify-between items-center mb-4 text-[#3e4f32]">
                  <span className="font-bold uppercase">Total do Pedido</span>
                  <span className="text-2xl font-black">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <button
                  onClick={checkout}
                  className="w-full bg-[#e26d5a] text-white font-bold text-lg uppercase tracking-widest p-4 rounded-xl shadow-md hover:bg-[#c95b4a] active:scale-[0.98] transition-transform flex justify-center items-center gap-2"
                >
                  Finalizar e Gerar Senha
                </button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS CONFIRMATION MODAL */}
      <AnimatePresence>
        {orderPlaced && (
          <div className="fixed inset-0 z-50 bg-[#3e4f32] flex flex-col items-center justify-center p-6 text-white text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white text-[#3e4f32] p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              {/* Zigzag receipt top styling simulate */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-[#3e4f32]" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
              
              <div className="w-20 h-20 bg-[#e8e4d3] border-4 border-[#3e4f32] rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <span className="text-4xl">🔥</span>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-widest mb-1">Pedido Confirmado!</h2>
              <p className="text-[#7a8a6d] mb-6 font-medium text-sm">Apresente este código no caixa para pagamento e retirada.</p>
              
              <div className="bg-[#f2efe4] p-6 rounded-2xl border-2 border-dashed border-[#81946f] mb-8">
                <p className="text-xs font-bold uppercase text-[#7a8a6d] mb-1 tracking-widest">Sua Senha</p>
                <p className="text-5xl font-black tracking-widest text-[#3e4f32]">{orderPlaced.id}</p>
                <div className="mt-4 pt-4 border-t border-[#d7ceb8] flex justify-between items-center text-left">
                  <span className="text-sm font-bold text-[#7a8a6d] uppercase">Total</span>
                  <span className="text-xl font-black text-[#e26d5a]">R$ {orderPlaced.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button
                onClick={() => setOrderPlaced(null)}
                className="w-full bg-[#3e4f32] text-white font-bold p-4 rounded-xl uppercase tracking-wider hover:bg-[#2b3821] active:scale-95 transition-all"
              >
                Fazer Novo Pedido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .clip-path-flag {
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 75%, 0% 100%);
        }
      `}} />
    </div>
  );
}

function menusByCategory(items: MenuItem[]) {
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
  return Object.entries(grouped);
}
