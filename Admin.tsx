import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Lock, LogOut, CheckCircle2, Clock } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const os: any[] = [];
      snapshot.forEach(doc => {
        os.push({ id: doc.id, ...doc.data() });
      });
      setOrders(os);
    }, (err) => {
      console.error(err);
      if (err.message.includes('permission-denied')) {
        setLoginError('Acesso negado. Sua conta não tem permissão (verifique se seu email foi confirmado).');
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError('Credenciais inválidas.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const toggleStatus = async (order: any) => {
    try {
      const newStatus = order.status === 'pending' ? 'completed' : 'pending';
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error('Update error', err);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#e7ecd9]">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e7ecd9] px-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-[#c5d1ae]">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#1a3d16] rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#e7ecd9]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-[#1a3d16] mb-8">Admin Login</h1>
          {loginError && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg">{loginError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1a3d16] mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#e7ecd9]/30 border border-[#c5d1ae] rounded-xl px-4 py-3 text-[#1a3d16] focus:outline-none focus:ring-2 focus:ring-[#1a3d16]" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a3d16] mb-1">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#e7ecd9]/30 border border-[#c5d1ae] rounded-xl px-4 py-3 text-[#1a3d16] focus:outline-none focus:ring-2 focus:ring-[#1a3d16]" 
              />
            </div>
            <button type="submit" className="w-full bg-[#1a3d16] text-[#e7ecd9] font-bold h-12 rounded-xl mt-4 hover:bg-[#132c10] transition-colors">
              Entrar
            </button>
            <p className="text-xs text-center text-[#3b5937] mt-4">
              Nota: Precisará confirmar o email após criar conta pelo Firebase Console.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e7ecd9] font-sans">
      <nav className="bg-[#1a3d16] h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-md">
        <h1 className="text-[#e7ecd9] font-bold text-lg">Painel Administrativo</h1>
        <div className="flex items-center gap-4 text-[#c5d1ae] text-sm">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="hover:text-white transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1a3d16]">Pedidos Recebidos</h2>
            <p className="text-[#3b5937]">Gerencie os pedidos do arraiá.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg text-sm font-bold text-[#1a3d16] shadow-sm">
            Total: {orders.length}
          </div>
        </div>

        {loginError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6">
            {loginError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl shadow-[#1a3d16]/5 overflow-hidden border border-[#c5d1ae]/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a3d16] text-[#e7ecd9] text-sm">
                <th className="p-4 font-semibold w-1/3">Itens</th>
                <th className="p-4 font-semibold w-1/6">Total</th>
                <th className="p-4 font-semibold w-1/6">Status</th>
                <th className="p-4 font-semibold text-right">Data</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map(order => {
                let parsedItems = [];
                try {
                  parsedItems = JSON.parse(order.items);
                } catch(e) {}
                
                return (
                <tr key={order.id} className="border-b border-[#c5d1ae]/30 hover:bg-[#e7ecd9]/20 transition-colors">
                  <td className="p-4 text-[#3b5937]">
                    <ul className="list-disc ml-4">
                      {parsedItems.map((item: any, idx: number) => (
                        <li key={idx}><span className="font-bold">{item.quantity}x</span> {item.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 font-bold text-[#1a3d16]">R$ {order.total.toFixed(2).replace('.', ',')}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(order)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {order.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {order.status === 'completed' ? 'Finalizado' : 'Pendente'}
                    </button>
                  </td>
                  <td className="p-4 text-right text-[#3b5937]">
                    {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '...'}
                  </td>
                </tr>
              )})}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#3b5937]">Nenhum pedido recebido ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
