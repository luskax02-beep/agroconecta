
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm font-medium">
                    © {new Date().getFullYear()} Agroconecta. Todos os direitos reservados.
                </p>
                <p className="text-sm mt-1 opacity-80 hover:opacity-100 transition-opacity">
                    Feito por Koike
                </p>
            </div>
        </footer>
    );
};

export default Footer;