import React from 'react';
import { Workflow, SortConfig } from '../types';
import { SortIcon } from './IconComponents';

interface WorkflowTableProps {
    workflows: Workflow[];
    onSort: (key: keyof Workflow) => void;
    sortConfig: SortConfig;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatus = (statecode: number, statuscode: number): { text: string; color: string; } => {
    if (statecode === 0) return { text: 'Draft', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' };
    if (statecode === 1) {
        if (statuscode === 2) return { text: 'Activated', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' };
    }
    return { text: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
};

const getCategory = (category: number): string => {
    switch (category) {
        case 0: return 'Workflow';
        case 1: return 'Dialog';
        case 2: return 'Business Rule';
        case 3: return 'Action';
        case 4: return 'Business Process Flow';
        case 5: return 'Modern Flow';
        default: return 'Unknown';
    }
};

const TableHeader: React.FC<{
    title: string;
    sortKey: keyof Workflow;
    onSort: (key: keyof Workflow) => void;
    sortConfig: SortConfig;
    className?: string;
}> = ({ title, sortKey, onSort, sortConfig, className = '' }) => {
    const isSorted = sortConfig.key === sortKey;
    const direction = isSorted ? sortConfig.direction : undefined;

    return (
        <th scope="col" className={`p-4 ${className}`}>
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className="group flex items-center gap-1.5 whitespace-nowrap"
            >
                {title}
                <SortIcon direction={direction} />
            </button>
        </th>
    );
};


export const WorkflowTable: React.FC<WorkflowTableProps> = ({ workflows, onSort, sortConfig }) => {
    return (
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-gray-700 dark:text-slate-300 sticky top-0">
                <tr>
                    <TableHeader title="Name" sortKey="name" onSort={onSort} sortConfig={sortConfig} className="text-left" />
                    <TableHeader title="Category" sortKey="category" onSort={onSort} sortConfig={sortConfig} className="text-left" />
                    <TableHeader title="Status" sortKey="statecode" onSort={onSort} sortConfig={sortConfig} className="text-center" />
                    <TableHeader title="Modified On" sortKey="modifiedon" onSort={onSort} sortConfig={sortConfig} className="text-left" />
                    <TableHeader title="Created On" sortKey="createdon" onSort={onSort} sortConfig={sortConfig} className="text-left" />
                </tr>
            </thead>
            <tbody>
                {workflows.map((workflow, index) => {
                    const status = getStatus(workflow.statecode, workflow.statuscode);
                    return (
                        <tr key={workflow.workflowid} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                            <td className="p-4 font-medium text-slate-900 dark:text-white">
                                <div className="font-semibold">{workflow.name}</div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">{workflow.uniquename}</div>
                            </td>
                            <td className="p-4">{getCategory(workflow.category)}</td>
                            <td className="p-4 text-center">
                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                    {status.text}
                                </span>
                            </td>
                            <td className="p-4 whitespace-nowrap">{formatDate(workflow.modifiedon)}</td>
                            <td className="p-4 whitespace-nowrap">{formatDate(workflow.createdon)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};