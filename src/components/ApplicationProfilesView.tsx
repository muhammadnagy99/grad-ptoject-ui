'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Copy, Edit2, Trash2, X } from 'lucide-react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { ApplicationProfileList, ApplicationProfile, BackendAsset } from '@/src/types';
import DualListSelector from './ui/DualListSelector';
import { useAuth } from '@/src/context/AuthContext';

export default function ApplicationProfilesView() {
    const { user } = useAuth();
    const [profileLists, setProfileLists] = useLocalStorage<ApplicationProfileList[]>('app_profile_lists', []);
    const [isCreating, setIsCreating] = useState(false);
    const [editListId, setEditListId] = useState<string | null>(null);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableProfiles, setAvailableProfiles] = useState<ApplicationProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await fetch('/api/assets');
                const result = await response.json();
                if (result.success && result.data) {
                    const profiles = result.data
                        .filter((asset: BackendAsset) => asset.asset_type === 'application_profile')
                        .map((asset: BackendAsset) => ({
                            id: asset.asset_id,
                            name: asset.name,
                            description: asset.description || '',
                            status: asset.status,
                            category: asset.category || ''
                        }));
                    setAvailableProfiles(profiles);
                }
            } catch (error) {
                console.error('Error fetching profiles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    // Form State
    const [newListName, setNewListName] = useState('');
    const [associatedProfiles, setAssociatedProfiles] = useState<ApplicationProfile[]>([]);

    const selectedList = profileLists.find(l => l.id === selectedListId);

    const handleSaveList = () => {
        if (!newListName.trim() || associatedProfiles.length === 0) return;

        if (editListId) {
            // Update existing
            setProfileLists(profileLists.map(l => l.id === editListId ? {
                ...l,
                name: newListName,
                profileIds: associatedProfiles.map(p => p.id),
                description: `App-Sim list with ${associatedProfiles.length} profiles`,
            } : l));
        } else {
            // Create new
            const newList: ApplicationProfileList = {
                id: `A-${Date.now()}`,
                name: newListName,
                description: `App-Sim list with ${associatedProfiles.length} profiles`,
                profileIds: associatedProfiles.map(p => p.id),
                createdAt: new Date().toLocaleDateString(),
                owner: user?.username || 'Unknown',
            };
            setProfileLists([...profileLists, newList]);
        }
        resetForm();
    };

    const handleEdit = () => {
        if (!selectedList) return;
        setEditListId(selectedList.id);
        setNewListName(selectedList.name);
        setAssociatedProfiles(availableProfiles.filter(p => selectedList.profileIds.includes(p.id)));
        setIsCreating(true);
    };

    const handleDuplicate = () => {
        if (!selectedList) return;
        const duplicatedList: ApplicationProfileList = {
            ...selectedList,
            id: `A-${Date.now()}`,
            name: `${selectedList.name} - copy`,
            createdAt: new Date().toLocaleDateString(),
        };
        setProfileLists([...profileLists, duplicatedList]);
    };

    const handleDelete = () => {
        if (!selectedListId) return;
        setProfileLists(profileLists.filter(l => l.id !== selectedListId));
        setSelectedListId(null);
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditListId(null);
        setNewListName('');
        setAssociatedProfiles([]);
    };

    const filteredLists = profileLists.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-xl font-semibold text-gray-500">Loading assets...</div>
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="bg-white min-h-[600px] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">{editListId ? 'Edit' : 'New'} Application Profile List</h2>
                        <button onClick={resetForm}><X size={24} /></button>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <label className="text-lg">Application Profile Name:</label>
                        <input
                            type="text"
                            className="border-b border-gray-400 focus:outline-none focus:border-blue-500 py-1 px-2 w-64"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                        />
                    </div>

                    <DualListSelector
                        availableItems={availableProfiles.filter(p => !associatedProfiles.find(ap => ap.id === p.id))}
                        associatedItems={associatedProfiles}
                        columns={[
                            { key: 'name', label: 'Application Profiles' },
                            { key: 'id', label: 'ID' },
                            { key: 'description', label: 'Description' }
                        ]}
                        onAdd={(item) => setAssociatedProfiles([...associatedProfiles, item as ApplicationProfile])}
                        onRemove={(item) => setAssociatedProfiles(associatedProfiles.filter(p => p.id !== item.id))}
                        searchPlaceholder="Search Application Profiles..."
                        associatedTitle="Associated Application Profiles"
                    />
                </div>

                <div className="p-6 mt-auto flex justify-end gap-4 border-t border-gray-200">
                    <button onClick={resetForm} className="px-8 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveList} className="px-8 py-2 bg-white border border-black rounded hover:bg-gray-50">
                        {editListId ? 'Update' : 'Save'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-6 p-6 min-h-[600px]">
            <div className="flex-1 flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">Application Profile Lists</h2>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Enter Profile Name"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="px-6 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50">Search</button>
                </div>

                <div className="border border-gray-200 rounded overflow-hidden flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-[#1A1A1A] text-white text-xs uppercase">
                            <tr>
                                <th className="p-3">App Profile List Name</th>
                                <th className="p-3">List ID</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Number of Applications</th>
                                <th className="p-3">Created at</th>
                                <th className="p-3">Owner</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredLists.map((list) => (
                                <tr
                                    key={list.id}
                                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedListId === list.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedListId(list.id)}
                                >
                                    <td className="p-3">{list.name}</td>
                                    <td className="p-3">{list.id}</td>
                                    <td className="p-3">{list.description}</td>
                                    <td className="p-3">{list.profileIds.length}</td>
                                    <td className="p-3">{list.createdAt}</td>
                                    <td className="p-3">{list.owner}</td>
                                </tr>
                            ))}
                            {filteredLists.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">No application profile lists found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsCreating(true)} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50">New</button>
                    <button
                        onClick={handleDuplicate}
                        disabled={!selectedListId}
                        className={`px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 ${!selectedListId ? 'text-gray-400 cursor-not-allowed' : ''}`}
                    >
                        Duplicate
                    </button>
                    <button
                        onClick={handleEdit}
                        disabled={!selectedListId}
                        className={`px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 ${!selectedListId ? 'text-gray-400 cursor-not-allowed' : ''}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!selectedListId}
                        className={`px-6 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 ${!selectedListId ? 'text-red-300 cursor-not-allowed' : ''}`}
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="w-80 border border-gray-200 rounded p-4 bg-white flex flex-col gap-4">
                <h3 className="font-semibold border-b pb-2">
                    {selectedList ? `${selectedList.name} Details` : 'Select a List'}
                </h3>
                {selectedList ? (
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm font-bold">App ID: {selectedList.id}</div>
                        </div>
                        <div>
                            <div className="text-sm font-bold mb-1">Application Profiles:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {selectedList.profileIds.map(id => (
                                    <li key={id}>{availableProfiles.find(p => p.id === id)?.name || id}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">Select a list to see its details</p>
                )}
            </div>
        </div>
    );
}
