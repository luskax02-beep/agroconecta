
import React from 'react';

const StreetViewIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5v3.75m0-3.75a3.75 3.75 0 0 1 3.75-3.75m-3.75 3.75a3.75 3.75 0 0 0-3.75-3.75" />
        <circle cx="12" cy="7" r="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default StreetViewIcon;
