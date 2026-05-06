
import React, { useState } from 'react';
import { UserProfile as UserProfileType } from '../types';
import SparkleIcon from './icons/SparkleIcon';
import MapPinIcon from './icons/MapPinIcon';

interface UserProfileProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfileType;
    onUpdateProfile: (profile: UserProfileType) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, profile, onUpdateProfile }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
    const [newCrop, setNewCrop] = useState('');

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAddCrop = () => {
        if (newCrop.trim()) {
            onUpdateProfile({ ...profile, crops: [...profile.crops, newCrop.trim()] });
            setNewCrop('');
        }
    };

    const handleRemoveCrop = (cropToRemove: string) => {
        onUpdateProfile({ ...profile, crops: profile.crops.filter(crop => crop !== cropToRemove) });
    };

    const getDiagnosisTitle = (markdown: string) => {
        const match = markdown.match(/## 🔍 Diagnóstico\s*\n([^\n]+)/);
        return match ? match[1].trim() : 'Análise Realizada';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel glow-hover rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-black/40 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-light text-white flex items-center gap-2 uppercase tracking-widest">
                            <SparkleIcon className="w-5 h-5" />
                            Produtor
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex border-b border-white/5">
                    <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'details' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                        Dados
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                        Histórico
                    </button>
                </div>

                <div className="overflow-y-auto p-8 flex-grow bg-transparent">
                    {activeTab === 'details' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Propriedade</label>
                                <input type="text" name="farmName" value={profile.farmName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white focus:bg-white/10 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Região</label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                                    <input type="text" name="location" value={profile.location} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white focus:bg-white/10 outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Culturas</label>
                                <div className="flex gap-2 mb-3">
                                    <input type="text" value={newCrop} onChange={(e) => setNewCrop(e.target.value)} className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white focus:bg-white/10 outline-none transition-all" placeholder="Adicionar..." />
                                    <button onClick={handleAddCrop} className="px-4 py-2 bg-white text-black font-bold uppercase text-xs rounded-xl hover:bg-zinc-200 hover:scale-[1.02] transition-transform">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.crops.map((crop, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-xl border border-white/10 text-xs text-zinc-300 bg-white/5">
                                            {crop}
                                            <button onClick={() => handleRemoveCrop(crop)} className="ml-2 hover:text-white">&times;</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {profile.history.map((item) => (
                                <div key={item.id} className="glass-panel p-4 rounded-xl border-white/10 hover:border-white/30 transition-all glow-hover cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                                        <h4 className="font-bold text-white text-sm group-hover:text-app-accent transition-colors">{getDiagnosisTitle(item.result.diagnosis)}</h4>
                                        <span className="text-[10px] text-zinc-500 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-zinc-400 font-light line-clamp-2">
                                         <div dangerouslySetInnerHTML={{__html: item.result.diagnosis.substring(0, 100)}} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
