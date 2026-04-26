
import React, { useState, useEffect } from 'react';
import { PastureListing } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import CowIcon from './icons/CowIcon';

interface PastoConectaProps {
    isOpen: boolean;
    onClose: () => void;
}

const PastoConecta: React.FC<PastoConectaProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
    const [listings, setListings] = useState<PastureListing[]>(() => {
        const storedListings = localStorage.getItem('agroconecta_pastures');
        if (storedListings) {
            return JSON.parse(storedListings);
        } else {
            const seedData: PastureListing[] = [
                {
                    id: '1',
                    title: 'Pasto Alta Mogiana - Lote A',
                    location: 'Franca, SP',
                    area: 45,
                    price: 2500,
                    description: 'Pasto de braquiária bem formado, com água natural.',
                    contactPhone: '(16) 99999-9999',
                    features: ['Curral', 'Água Natural'],
                    ownerName: 'Roberto Almeida',
                    createdAt: Date.now()
                }
            ];
            localStorage.setItem('agroconecta_pastures', JSON.stringify(seedData));
            return seedData;
        }
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        area: '',
        price: '',
        description: '',
        contactPhone: '',
        ownerName: ''
    });

    useEffect(() => {
        // Any side effects related to listings can go here, but initialization is moved to useState
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newListing: PastureListing = {
            id: Date.now().toString(),
            title: formData.title,
            location: formData.location,
            area: Number(formData.area),
            price: Number(formData.price),
            description: formData.description,
            contactPhone: formData.contactPhone,
            features: [], 
            ownerName: formData.ownerName || 'Anônimo',
            createdAt: Date.now()
        };

        const updatedListings = [newListing, ...listings];
        setListings(updatedListings);
        localStorage.setItem('agroconecta_pastures', JSON.stringify(updatedListings));
        
        setFormData({ title: '', location: '', area: '', price: '', description: '', contactPhone: '', ownerName: '' });
        setNotification('Anúncio publicado.');
        setTimeout(() => setNotification(null), 3000);
        setActiveTab('browse');
    };

    if (!isOpen) return null;

    const filteredListings = listings.filter(l => 
        l.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-black border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
                
                {notification && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full shadow-glow z-50 animate-fade-in-up font-bold text-sm">
                        {notification}
                    </div>
                )}

                {/* Header */}
                <div className="bg-zinc-900/50 p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-light text-white flex items-center gap-2 tracking-widest uppercase">
                            <CowIcon className="w-6 h-6" />
                            Marketplace
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button onClick={() => setActiveTab('browse')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'browse' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                        Buscar Áreas
                    </button>
                    <button onClick={() => setActiveTab('create')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                        Anunciar
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 bg-black">
                    {activeTab === 'browse' && (
                        <div className="space-y-6">
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input 
                                    type="text" 
                                    placeholder="FILTRAR POR LOCALIZAÇÃO..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-600 focus:border-white outline-none transition-all"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {filteredListings.map(item => (
                                    <div key={item.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-white/30 transition-all group overflow-hidden flex flex-col">
                                        <div className="h-24 bg-zinc-800 flex items-center justify-center relative">
                                            <CowIcon className="w-8 h-8 text-zinc-600 group-hover:text-white transition-colors" />
                                            <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                                                {item.area} HA
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                            <p className="flex items-center text-xs text-zinc-500 mb-3 uppercase tracking-wider">
                                                {item.location}
                                            </p>
                                            <p className="text-zinc-400 text-sm line-clamp-2 mb-4 flex-grow font-light">
                                                {item.description}
                                            </p>
                                            <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
                                                <div>
                                                    <div className="text-lg font-bold text-white">R$ {item.price}</div>
                                                    <span className="text-[10px] text-zinc-500 uppercase">Mensal</span>
                                                </div>
                                                <button onClick={() => alert('Contact: ' + item.contactPhone)} className="bg-white text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">
                                                    Contato
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'create' && (
                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 bg-zinc-900/30 p-8 rounded-xl border border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Título</label>
                                    <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2 bg-black border border-zinc-700 rounded text-white focus:border-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Localização</label>
                                    <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2 bg-black border border-zinc-700 rounded text-white focus:border-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Área (Ha)</label>
                                    <input required name="area" type="number" value={formData.area} onChange={handleInputChange} className="w-full px-4 py-2 bg-black border border-zinc-700 rounded text-white focus:border-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Preço (R$)</label>
                                    <input required name="price" type="number" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 bg-black border border-zinc-700 rounded text-white focus:border-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Telefone</label>
                                    <input required name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className="w-full px-4 py-2 bg-black border border-zinc-700 rounded text-white focus:border-white outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Descrição</label>
                                    <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 bg-black border border-zinc-700 rounded text-white focus:border-white outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors shadow-glow-sm">
                                Publicar
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PastoConecta;
