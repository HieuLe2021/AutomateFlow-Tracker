import React from 'react';

export const LogoIcon: React.FC = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

interface SortIconProps {
    direction?: 'ascending' | 'descending';
}

export const SortIcon: React.FC<SortIconProps> = ({ direction }) => {
    return (
        <span className="flex-none rounded bg-slate-100 text-slate-400 group-hover:bg-slate-200 dark:bg-gray-600 dark:text-slate-400 dark:group-hover:bg-gray-500">
            {direction === 'ascending' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-800 dark:text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
            )}
            {direction === 'descending' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-800 dark:text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            )}
            {!direction && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
            )}
        </span>
    );
};