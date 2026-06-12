import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function QuoteForm() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [areaAndLocation, setAreaAndLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const quoteRef = doc(collection(db, 'quotes'));
      
      await setDoc(quoteRef, {
        name,
        whatsapp,
        areaAndLocation,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      
      // Redirect to whatsapp with message
      const text = `Olá! Meu nome é ${name}, gostaria de solicitar um orçamento agronômico.
Tamanho da Área: ${areaAndLocation}
Meu WhatsApp: ${whatsapp}`;
      
      setTimeout(() => {
        window.open(`https://wa.me/5569999357831?text=${encodeURIComponent(text)}`, '_blank');
        setName('');
        setWhatsapp('');
        setAreaAndLocation('');
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError('Houve um erro ao enviar. Tente diretamente pelo WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#e7ecd9] p-6 rounded-2xl border border-[#c5d1ae] text-center">
        <h4 className="text-xl font-bold text-[#1a3d16] mb-2">Enviado com sucesso!</h4>
        <p className="text-[#3b5937]">Redirecionando para o WhatsApp...</p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-[#1a3d16] mb-1.5 ml-1">Nome Completo</label>
        <input 
          required 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full bg-[#e7ecd9]/50 border border-[#c5d1ae] rounded-2xl px-5 py-4 text-[#1a3d16] focus:outline-none focus:ring-2 focus:ring-[#1a3d16] focus:border-[#1a3d16] transition-all font-medium" 
          placeholder="Ex: José dos Santos" 
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#1a3d16] mb-1.5 ml-1">WhatsApp</label>
        <input 
          required 
          type="tel" 
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          maxLength={20}
          className="w-full bg-[#e7ecd9]/50 border border-[#c5d1ae] rounded-2xl px-5 py-4 text-[#1a3d16] focus:outline-none focus:ring-2 focus:ring-[#1a3d16] focus:border-[#1a3d16] transition-all font-medium" 
          placeholder="Ex: (69) 99999-9999" 
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#1a3d16] mb-1.5 ml-1">Tamanho da Área (Hectares) e Localização</label>
        <input 
          required 
          type="text" 
          value={areaAndLocation}
          onChange={(e) => setAreaAndLocation(e.target.value)}
          maxLength={200}
          className="w-full bg-[#e7ecd9]/50 border border-[#c5d1ae] rounded-2xl px-5 py-4 text-[#1a3d16] focus:outline-none focus:ring-2 focus:ring-[#1a3d16] focus:border-[#1a3d16] transition-all font-medium" 
          placeholder="Ex: 50ha na Linha 65" 
        />
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-[#1a3d16] hover:bg-[#132c10] disabled:bg-[#1a3d16]/50 text-[#e7ecd9] font-bold text-lg h-16 rounded-2xl mt-4 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center"
      >
        {isSubmitting ? 'Enviando...' : 'Falar no WhatsApp'}
      </button>
    </form>
  );
}
