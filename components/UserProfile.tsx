
import React, { useState } from 'react';
import { UserProfile as UserProfileType, HistoryItem } from '../types';
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
        onUpdateProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handleAddCrop = () => {
        if (newCrop.trim()) {
            onUpdateProfile({
                ...profile,
                crops: [...profile.crops, newCrop.trim()]
            });
            setNewCrop('');
        }
    };

    const handleRemoveCrop = (cropToRemove: string) => {
        onUpdateProfile({
            ...profile,
            crops: profile.crops.filter(crop => crop !== cropToRemove)
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCrop();
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper to extract a title from the markdown diagnosis
    const getDiagnosisTitle = (markdown: string) => {
        const match = markdown.match(/## 🔍 Diagnóstico\s*\n([^\n]+)/);
        return match ? match[1].trim() : 'Análise Realizada';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <SparkleIcon className="w-6 h-6" />
                            Perfil do Produtor
                        </h2>
                        <p className="opacity-90 text-sm mt-1">Gerencie sua fazenda e histórico</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-emerald-700 p-2 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                            activeTab === 'details'
                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Dados da Fazenda
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                            activeTab === 'history'
                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Histórico de Problemas ({profile.history.length})
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 flex-grow">
                    {activeTab === 'details' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nome da Propriedade
                                </label>
                                <input
                                    type="text"
                                    name="farmName"
                                    value={profile.farmName}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Fazenda Santa Maria"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Localização / Cidade
                                </label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={profile.location}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Ariquemes, RO"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Culturas Atuais
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newCrop}
                                        onChange={(e) => setNewCrop(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Adicionar cultura (ex: Soja)"
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                    <button
                                        onClick={handleAddCrop}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.crops.length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhuma cultura cadastrada.</p>
                                    )}
                                    {profile.crops.map((crop, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                            {crop}
                                            <button
                                                onClick={() => handleRemoveCrop(crop)}
                                                className="ml-2 hover:text-emerald-900 dark:hover:text-emerald-100 focus:outline-none"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {profile.history.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    <SparkleIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>Nenhuma análise registrada ainda.</p>
                                    <p className="text-sm">As análises que você fizer aparecerão aqui.</p>
                                </div>
                            ) : (
                                profile.history.slice().reverse().map((item) => (
                                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-md">
                                                {getDiagnosisTitle(item.result.diagnosis)}
                                            </h4>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                                {formatDate(item.timestamp)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 overflow-hidden text-ellipsis prose prose-sm dark:prose-invert max-w-none">
                                            {/* Render a plain text preview if possible, otherwise just a snippet hint */}
                                            <div dangerouslySetInnerHTML={{__html: item.result.diagnosis.substring(0, 150) + "..."}} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0 text-right">
                     <button
                        onClick={onClose}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
                    >
                        Concluir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
