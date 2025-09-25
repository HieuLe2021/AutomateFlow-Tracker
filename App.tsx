
import React, { useState, useEffect, useCallback } from 'react';
import { Workflow, SortConfig } from './types';
import { fetchWorkflows } from './services/dataverseService';
import { WorkflowTable } from './components/WorkflowTable';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { SearchBar } from './components/SearchBar';
import { LogoIcon } from './components/IconComponents';
import { ThemeToggle } from './components/ThemeToggle';

const getInitialTheme = (): 'light' | 'dark' => {
    // FIX: Replaced 'and' with the correct logical AND operator '&&'.
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = window.localStorage.getItem('theme');
        if (storedPrefs === 'light' || storedPrefs === 'dark') {
            return storedPrefs;
        }
        const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (userMedia.matches) {
            return 'dark';
        }
    }
    return 'light';
};

const ChevronLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);
  
const ChevronRightIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const CATEGORIES = {
    0: 'Workflow',
    1: 'Dialog',
    2: 'Business Rule',
    3: 'Action',
    4: 'Business Process Flow',
    5: 'Modern Flow',
};

const STATUSES = {
    0: 'Draft',
    1: 'Activated',
};

interface PaginationProps {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    onNext: () => void;
    onPrev: () => void;
    hasNextPage: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, pageSize, totalCount, onNext, onPrev, hasNextPage }) => {
    if (totalCount === 0) {
        return null;
    }

    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalCount);
    const hasPrevPage = currentPage > 1;

    return (
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex}</span>
                {' to '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{endIndex}</span>
                {' of '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span>
                {' results'}
                <span className="hidden sm:inline">{' | '}</span>
                <br className="sm:hidden" />
                Page <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrev}
                    disabled={!hasPrevPage}
                    className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-700"
                    aria-label="Previous page"
                >
                    Previous
                </button>
                <button
                    onClick={onNext}
                    disabled={!hasNextPage}
                    className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-700"
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'modifiedon', direction: 'descending' });
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
    const [appliedFilters, setAppliedFilters] = useState({ search: '', category: null as number | null, status: null as number | null });

    // Pagination state
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextLink, setNextLink] = useState<string | null>(null);
    const [pageUrlHistory, setPageUrlHistory] = useState<string[]>([]);
    const pageSize = 50;

    const fetchPageData = useCallback(async (url: string | undefined, isNewQuery: boolean) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWorkflows(sortConfig, appliedFilters.search, appliedFilters.category, appliedFilters.status, url);
            setWorkflows(data.workflows);
            setTotalCount(data.totalCount);
            setNextLink(data.nextLink);
            if (isNewQuery) {
                setCurrentPage(1);
                setPageUrlHistory([data.requestUrl]);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to fetch data: ${err.message}. Please check console for details.`);
            } else {
                setError('An unknown error occurred.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [sortConfig, appliedFilters]);
    
    // Effect for initial load and when filters/sort change
    useEffect(() => {
        fetchPageData(undefined, true);
    }, [appliedFilters, sortConfig, fetchPageData]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleSort = useCallback((key: keyof Workflow) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
        }));
    }, []);

    const handleApplyFilters = () => {
        setAppliedFilters({ search: searchTerm, category: selectedCategory, status: selectedStatus });
    };

    const handleNextPage = useCallback(async () => {
        if (!nextLink || isLoading) return;
        setCurrentPage(prev => prev + 1);
        setPageUrlHistory(prev => [...prev, nextLink]);
        await fetchPageData(nextLink, false);
    }, [nextLink, isLoading, fetchPageData]);

    const handlePrevPage = useCallback(async () => {
        if (currentPage <= 1 || isLoading) return;
        const newHistory = [...pageUrlHistory];
        newHistory.pop(); // Remove current page
        const prevPageUrl = newHistory[newHistory.length - 1];
        
        if (prevPageUrl) {
            setCurrentPage(prev => prev - 1);
            setPageUrlHistory(newHistory);
            await fetchPageData(prevPageUrl, false);
        }
    }, [currentPage, pageUrlHistory, isLoading, fetchPageData]);


    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            
            <div className="flex-grow flex overflow-hidden p-4">
                {/* Sidebar */}
                <aside className={`flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-slate-900/5 dark:ring-white/10 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72' : 'w-0'} overflow-hidden`}>
                    <div className="h-full flex flex-col p-4">
                        <div className="flex-grow space-y-6">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                <select
                                    id="category"
                                    value={selectedCategory ?? ''}
                                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                                    className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">All Categories</option>
                                    {Object.entries(CATEGORIES).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select
                                    id="status"
                                    value={selectedStatus ?? ''}
                                    onChange={(e) => setSelectedStatus(e.target.value ? Number(e.target.value) : null)}
                                    className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">All Statuses</option>
                                    {Object.entries(STATUSES).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleApplyFilters}
                            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition"
                        >
                            Apply Filters
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-4' : ''}`}>
                     <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute top-1/2 -translate-y-1/2 -left-4 z-20 w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 shadow-md flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition"
                        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                     >
                        {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                     </button>
                    
                     <div className="flex flex-col flex-grow bg-white rounded-xl shadow-lg ring-1 ring-slate-900/5 dark:bg-gray-800 dark:ring-white/10 overflow-hidden">
                        <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-gray-700">
                            <LogoIcon />
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                AutomateFlow Tracker
                            </h1>
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-gray-700">
                           <div className="w-full sm:max-w-sm">
                             <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                           </div>
                           <Pagination
                                currentPage={currentPage}
                                pageSize={pageSize}
                                totalCount={totalCount}
                                onNext={handleNextPage}
                                onPrev={handlePrevPage}
                                hasNextPage={!!nextLink}
                            />
                        </div>

                        <div className="flex-grow relative overflow-y-auto">
                            {isLoading && <LoadingSpinner />}
                            {error && <ErrorMessage message={error} />}
                            {!isLoading && !error && (
                                <WorkflowTable 
                                    workflows={workflows}
                                    onSort={handleSort}
                                    sortConfig={sortConfig}
                                />
                            )}
                            {!isLoading && !error && totalCount === 0 && (
                                <div className="text-center p-16 text-slate-500 dark:text-slate-400">
                                    <h3 className="text-xl font-semibold">No Workflows Found</h3>
                                    <p>Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </div>
                     </div>
                </main>
            </div>
        </div>
    );
};

export default App;
