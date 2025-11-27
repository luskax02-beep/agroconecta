
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
    const [listings, setListings] = useState<PastureListing[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    // Form State
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
        const storedListings = localStorage.getItem('agroconecta_pastures');
        if (storedListings) {
            setListings(JSON.parse(storedListings));
        } else {
            // Seed data for demonstration
            const seedData: PastureListing[] = [
                {
                    id: '1',
                    title: 'Pasto Verdejante Alta Mogiana',
                    location: 'Franca, SP',
                    area: 45,
                    price: 2500,
                    description: 'Pasto de braquiária bem formado, com água natural e curral novo. Ideal para engorda.',
                    contactPhone: '(16) 99999-9999',
                    features: ['Curral', 'Água Natural', 'Cerca Nova'],
                    ownerName: 'Roberto Almeida',
                    createdAt: Date.now()
                },
                {
                    id: '2',
                    title: 'Fazenda Santa Luzia - Lote B',
                    location: 'Goiânia, GO',
                    area: 120,
                    price: 5000,
                    description: 'Área plana, excelente para gado de corte. Acesso fácil pela rodovia.',
                    contactPhone: '(62) 98888-8888',
                    features: ['Energia Elétrica', 'Embarcador'],
                    ownerName: 'Ana Souza',
                    createdAt: Date.now() - 10000000
                }
            ];
            setListings(seedData);
            localStorage.setItem('agroconecta_pastures', JSON.stringify(seedData));
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
            features: ['Cerca Arame Liso', 'Água'], // Default features for simplicity
            ownerName: formData.ownerName || 'Anônimo',
            createdAt: Date.now()
        };

        const updatedListings = [newListing, ...listings];
        setListings(updatedListings);
        localStorage.setItem('agroconecta_pastures', JSON.stringify(updatedListings));
        
        // Reset form and show success
        setFormData({
            title: '', location: '', area: '', price: '', description: '', contactPhone: '', ownerName: ''
        });
        setNotification('Anúncio publicado com sucesso!');
        setTimeout(() => setNotification(null), 3000);
        setActiveTab('browse');
    };

    const handleInterest = (phone: string) => {
        alert(`Redirecionando para WhatsApp: ${phone}\n\n(Simulação de contato iniciada)`);
    };

    if (!isOpen) return null;

    const filteredListings = listings.filter(l => 
        l.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col relative">
                
                {/* Notification Toast */}
                {notification && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full shadow-lg z-50 animate-fade-in-up">
                        {notification}
                    </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CowIcon className="w-8 h-8" />
                            PastoConecta
                        </h2>
                        <p className="opacity-90 text-sm mt-1">O marketplace de arrendamento rural</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${
                            activeTab === 'browse'
                                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        ENCONTRAR PASTO
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${
                            activeTab === 'create'
                                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        ANUNCIAR PROPRIEDADE
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900/50">
                    
                    {activeTab === 'browse' && (
                        <div className="space-y-6">
                            {/* Search */}
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por cidade ou região..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>

                            {/* List */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {filteredListings.length === 0 ? (
                                    <div className="col-span-2 text-center py-12 text-gray-500">
                                        <p>Nenhum pasto encontrado nesta região.</p>
                                    </div>
                                ) : (
                                    filteredListings.map(item => (
                                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                                            <div className="h-32 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center relative">
                                                <CowIcon className="w-12 h-12 text-emerald-600/30 dark:text-emerald-400/30" />
                                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-white shadow-sm">
                                                    {item.area} Hectares
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                                    {item.location}
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4 flex-grow">
                                                    {item.description}
                                                </p>
                                                <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <div>
                                                        <span className="text-xs text-gray-500 uppercase font-semibold">Valor Mensal</span>
                                                        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                            R$ {item.price.toLocaleString('pt-BR')}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleInterest(item.contactPhone)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                                    >
                                                        Tenho Interesse
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'create' && (
                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Cadastrar Pasto</h3>
                                <p className="text-sm text-gray-500">Preencha as informações para disponibilizar sua área.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do Anúncio</label>
                                    <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Pasto formado para 50 cabeças" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localização (Cidade/Estado)</label>
                                    <input required name="location" value={formData.location} onChange={handleInputChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Rio Verde, GO" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Área Total (Hectares)</label>
                                    <input required name="area" value={formData.area} onChange={handleInputChange} type="number" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: 30" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço Mensal (R$)</label>
                                    <input required name="price" value={formData.price} onChange={handleInputChange} type="number" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: 1500" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone / WhatsApp</label>
                                    <input required name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: (62) 99999-9999" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Proprietário</label>
                                    <input required name="ownerName" value={formData.ownerName} onChange={handleInputChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Seu nome" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição Detalhada</label>
                                    <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Descreva os recursos: tipo de capim, recursos hídricos, cercas..." />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                Publicar Anúncio
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PastoConecta;
