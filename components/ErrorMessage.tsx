import React from 'react';

interface ErrorMessageProps {
    message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="p-8 text-center">
            <div className="inline-flex items-center bg-red-100 text-red-800 border border-red-200 rounded-lg p-4 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                    <h3 className="text-lg font-semibold">An Error Occurred</h3>
                    <p className="text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
};