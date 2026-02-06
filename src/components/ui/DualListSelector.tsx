'use client';

import { useState } from 'react';
import { Search, Plus, Minus } from 'lucide-react';

interface Column {
    key: string;
    label: string;
}

interface Item {
    id: string;
    [key: string]: any;
}

interface DualListSelectorProps {
    availableItems: Item[];
    associatedItems: Item[];
    columns: Column[];
    onAdd: (item: Item) => void;
    onRemove: (item: Item) => void;
    searchPlaceholder?: string;
    associatedTitle?: string;
}

export default function DualListSelector({
    availableItems,
    associatedItems,
    columns,
    onAdd,
    onRemove,
    searchPlaceholder = 'Search...',
    associatedTitle = 'Associated',
}: DualListSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAvailable = availableItems.filter((item) =>
        columns.some((col) =>
            String(item[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const Table = ({ items, action, isAssociated }: { items: Item[]; action: (item: Item) => void; isAssociated: boolean }) => (
        <div className="border border-gray-200 rounded overflow-hidden flex-1 flex flex-col min-h-[400px]">
            <div className="bg-[#1A1A1A] text-white grid" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 40px` }}>
                {columns.map((col) => (
                    <div key={col.key} className="p-2 text-xs font-semibold uppercase">{col.label}</div>
                ))}
                <div className="p-2"></div>
            </div>
            <div className="overflow-y-auto flex-1 bg-white">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">No items</div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="grid border-b border-gray-100 hover:bg-gray-50 text-sm"
                            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 40px` }}
                        >
                            {columns.map((col) => (
                                <div key={col.key} className="p-2 truncate">{item[col.key]}</div>
                            ))}
                            <div className="p-1 flex items-center justify-center">
                                <button
                                    onClick={() => action(item)}
                                    className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${isAssociated ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-blue-500 hover:bg-blue-50'
                                        }`}
                                >
                                    {isAssociated ? <Minus size={16} /> : <Plus size={16} />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50">Search</button>
                    </div>
                    <Table items={filteredAvailable} action={onAdd} isAssociated={false} />
                </div>

                <div className="flex items-center justify-center px-4">
                    <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                        <Search className="rotate-90" size={24} />
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="font-semibold text-gray-700 h-[42px] flex items-center">
                        {associatedTitle}
                    </div>
                    <Table items={associatedItems} action={onRemove} isAssociated={true} />
                </div>
            </div>
        </div>
    );
}
