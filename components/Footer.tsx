import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
            <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">
                    © {new Date().getFullYear()} Agroconecta. Todos os direitos reservados.
                </p>
                <p className="text-sm mt-2">
                    Feito com ❤️ e Gemini API
                </p>
            </div>
        </footer>
    );
};

export default Footer;
