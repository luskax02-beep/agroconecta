
import { UserProfile, AnalysisResult, HistoryItem, PastureListing } from '../types';

// Simulating a database schema keys
const DB_KEYS = {
    PROFILE: 'agroconecta_db_profile',
    AUTH: 'agroconecta_db_auth',
    MARKETPLACE: 'agroconecta_db_marketplace',
    SETTINGS: 'agroconecta_db_settings'
};

// Default Initial State
const defaultProfile: UserProfile = {
    farmName: '',
    location: '',
    crops: [],
    history: []
};

export const db = {
    user: {
        isAuthenticated: (): boolean => {
            return localStorage.getItem(DB_KEYS.AUTH) === 'true';
        },
        login: () => {
            localStorage.setItem(DB_KEYS.AUTH, 'true');
        },
        logout: () => {
            localStorage.removeItem(DB_KEYS.AUTH);
        },
        getProfile: (): UserProfile => {
            try {
                const data = localStorage.getItem(DB_KEYS.PROFILE);
                return data ? JSON.parse(data) : defaultProfile;
            } catch {
                return defaultProfile;
            }
        },
        updateProfile: (profile: UserProfile) => {
            localStorage.setItem(DB_KEYS.PROFILE, JSON.stringify(profile));
        },
        addHistoryItem: (result: AnalysisResult) => {
            const profile = db.user.getProfile();
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                result: result
            };
            profile.history.unshift(newItem); // Add to beginning
            db.user.updateProfile(profile);
        }
    },
    marketplace: {
        getListings: (): PastureListing[] => {
            try {
                const data = localStorage.getItem(DB_KEYS.MARKETPLACE);
                if (data) return JSON.parse(data);
                
                // Seed data if empty
                const seed: PastureListing[] = [{
                    id: '1',
                    title: 'Pasto Alta Mogiana - Premium',
                    location: 'Franca, SP',
                    area: 45,
                    price: 2500,
                    description: 'Pasto de braquiária bem formado, irrigado, com água natural.',
                    contactPhone: '(16) 99999-9999',
                    features: ['Curral', 'Água Natural', 'Internet'],
                    ownerName: 'Roberto Almeida',
                    createdAt: Date.now()
                }];
                localStorage.setItem(DB_KEYS.MARKETPLACE, JSON.stringify(seed));
                return seed;
            } catch {
                return [];
            }
        },
        addListing: (listing: PastureListing) => {
            const current = db.marketplace.getListings();
            const updated = [listing, ...current];
            localStorage.setItem(DB_KEYS.MARKETPLACE, JSON.stringify(updated));
        }
    }
};
