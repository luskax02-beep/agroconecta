
import React from 'react';

const CowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M16 4h-4" />
        <path d="M9 4v11a5 5 0 0 0 5 5v-5h3" />
        <path d="M8 8a2 2 0 0 1 0 4 2 2 0 0 1 0-4Z" />
        <path d="M12 11h.01" />
        <path d="M19 19v-6a2 2 0 0 0-2-2H7" />
    </svg>
);

export default CowIcon;
