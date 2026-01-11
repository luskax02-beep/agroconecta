
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-black border-t border-white/10 py-8 mt-auto relative z-20">
            <div className="container mx-auto px-4 text-center">
                <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">
                    © {new Date().getFullYear()} Agroconecta
                </p>
                <p className="text-[10px] text-zinc-800 mt-2 font-mono">
                    Inteligência Artificial Agrícola
                </p>
            </div>
        </footer>
    );
};

export default Footer;
