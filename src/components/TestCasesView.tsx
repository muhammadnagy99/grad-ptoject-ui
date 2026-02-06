'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Play, Info, MoreVertical, X, Check, List, AlertCircle, Save } from 'lucide-react';
import { TestCase, ApplicationProfileList, StrikeList, ComponentSettings, ApplicationProfile, Strike, BackendAsset } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';

export default function TestCasesView() {
    const { user } = useAuth();
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [profileLists, setProfileLists] = useState<ApplicationProfileList[]>([]);
    const [strikeLists, setStrikeLists] = useState<StrikeList[]>([]);

    const [isCreating, setIsCreating] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [availableProfiles, setAvailableProfiles] = useState<ApplicationProfile[]>([]);
    const [availableStrikes, setAvailableStrikes] = useState<Strike[]>([]);
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
                    const strikes = result.data
                        .filter((asset: BackendAsset) => asset.asset_type === 'strike')
                        .map((asset: BackendAsset) => ({
                            id: asset.asset_id,
                            name: asset.name,
                            type: asset.category || 'general',
                            description: asset.description || '',
                            status: asset.status,
                            category: asset.category || ''
                        }));
                    setAvailableProfiles(profiles);
                    setAvailableStrikes(strikes);
                }
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    useEffect(() => {
        const pLists = localStorage.getItem('app_profile_lists');
        if (pLists) setProfileLists(JSON.parse(pLists));

        const sLists = localStorage.getItem('strike_lists');
        if (sLists) setStrikeLists(JSON.parse(sLists));

        const tCases = localStorage.getItem('test_cases');
        if (tCases) setTestCases(JSON.parse(tCases));
    }, []);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAppListId, setSelectedAppListId] = useState('');
    const [selectedStrikeListId, setSelectedStrikeListId] = useState('');
    const [lockToUser, setLockToUser] = useState(false);

    const [bandwidth, setBandwidth] = useState<ComponentSettings>({ current: 0, original: 0, percentChange: 100 });
    const [flows, setFlows] = useState<ComponentSettings>({ current: 0, original: 0, percentChange: 100 });
    const [attacks, setAttacks] = useState<ComponentSettings>({ current: 0, original: 0, percentChange: 100 });

    const selectedTest = testCases.find(t => t.id === selectedTestId);
    const currentAppList = profileLists.find(l => l.id === selectedAppListId);
    const currentStrikeList = strikeLists.find(l => l.id === selectedStrikeListId);

    const handleSaveTest = () => {
        if (!name.trim() || !selectedAppListId || !selectedStrikeListId) return;

        const newTest: TestCase = {
            id: `T-2025-${Date.now().toString().slice(-4)}`,
            name,
            description,
            applicationListId: selectedAppListId,
            strikeListId: selectedStrikeListId,
            settings: {
                bandwidth,
                concurrentFlows: flows,
                totalAttacks: attacks,
            },
            deviceUnderTest: 'Switch', // Defaulting from wireframe
            lockToUser,
            createdAt: new Date().toLocaleDateString(),
            owner: user?.username || 'Unknown',
        };

        setTestCases([...testCases, newTest]);
        resetForm();
    };

    const resetForm = () => {
        setIsCreating(false);
        setName('');
        setDescription('');
        setSelectedAppListId('');
        setSelectedStrikeListId('');
        setBandwidth({ current: 0, original: 0, percentChange: 100 });
        setFlows({ current: 0, original: 0, percentChange: 100 });
        setAttacks({ current: 0, original: 0, percentChange: 100 });
    };

    const SettingRow = ({ label, unit, state, setState }: { label: string; unit: string; state: ComponentSettings; setState: (s: ComponentSettings) => void }) => (
        <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">{label}</div>
            <div className="grid grid-cols-3 gap-2">
                <div className="border border-gray-200 rounded p-1">
                    <div className="bg-[#1A1A1A] text-white text-[10px] px-2 py-0.5 rounded-t-sm uppercase">Current</div>
                    <div className="flex items-center gap-1 p-1">
                        <input
                            type="number"
                            className="w-full text-sm outline-none"
                            value={state.current}
                            onChange={e => setState({ ...state, current: Number(e.target.value) })}
                        />
                        <span className="text-[10px] text-gray-400">{unit}</span>
                    </div>
                </div>
                <div className="border border-gray-200 rounded p-1">
                    <div className="bg-[#1A1A1A] text-white text-[10px] px-2 py-0.5 rounded-t-sm uppercase">Original</div>
                    <div className="flex items-center gap-1 p-1">
                        <input
                            type="number"
                            className="w-full text-sm outline-none"
                            value={state.original}
                            onChange={e => setState({ ...state, original: Number(e.target.value) })}
                        />
                        <span className="text-[10px] text-gray-400">{unit}</span>
                    </div>
                </div>
                <div className="border border-gray-200 rounded p-1">
                    <div className="bg-[#1A1A1A] text-white text-[10px] px-2 py-0.5 rounded-t-sm uppercase">Percent Change</div>
                    <div className="flex items-center justify-between p-1">
                        <span className="text-sm">{state.percentChange}%</span>
                        <div className="flex gap-1">
                            <button className="bg-blue-100 text-blue-600 text-[10px] px-1 rounded">SET</button>
                            <button className="bg-gray-100 text-gray-600 text-[10px] px-1 rounded">RESET</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const filteredTestCases = testCases.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <form onSubmit={handleSaveTest} className="bg-white min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Create Test</h2>
                        <button onClick={resetForm}><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 flex gap-6 p-6">
                    {/* Left Panel: Components */}
                    <div className="w-64 space-y-4">
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-[#1A1A1A] text-white p-2 text-sm font-semibold">Test Components</div>
                            <div className="p-2 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold flex justify-between items-center">
                                        Applications List <List size={14} />
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={selectedAppListId}
                                        onChange={(e) => setSelectedAppListId(e.target.value)}
                                    >
                                        <option value="">Select List</option>
                                        {profileLists.map((l: ApplicationProfileList) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    {currentAppList && (
                                        <div className="pl-2 pt-1 space-y-0.5">
                                            {currentAppList.profileIds.slice(0, 3).map((id: string) => (
                                                <div key={id} className="text-[10px] text-gray-500">• {availableProfiles.find(p => p.id === id)?.name || id}</div>
                                            ))}
                                            {currentAppList.profileIds.length > 3 && <div className="text-[10px] text-gray-400 pl-2">...and {currentAppList.profileIds.length - 3} more</div>}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold flex justify-between items-center">
                                        Strikes List <Save size={14} />
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded p-1 text-sm"
                                        value={selectedStrikeListId}
                                        onChange={(e) => setSelectedStrikeListId(e.target.value)}
                                    >
                                        <option value="">Select List</option>
                                        {strikeLists.map((l: StrikeList) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    {currentStrikeList && (
                                        <div className="pl-2 pt-1 space-y-0.5">
                                            {currentStrikeList.strikeIds.slice(0, 3).map((id: string) => (
                                                <div key={id} className="text-[10px] text-gray-500">• {availableStrikes.find(s => s.id === id)?.name || id}</div>
                                            ))}
                                            {currentStrikeList.strikeIds.length > 3 && <div className="text-[10px] text-gray-400 pl-2">...and {currentStrikeList.strikeIds.length - 3} more</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-[#1A1A1A] text-white p-2 text-sm font-semibold">Test Criteria</div>
                            <div className="p-2 h-24 bg-gray-50 flex items-center justify-center">
                                <div className="w-full space-y-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-1 bg-gray-200 rounded w-full"></div>)}
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-[#1A1A1A] text-white p-2 text-sm font-semibold">Device Under Test</div>
                            <div className="p-2">
                                <select className="w-full border border-gray-300 rounded p-1 text-sm">
                                    <option>Switch</option>
                                    <option>Router</option>
                                    <option>Firewall</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Middle Panel: Settings */}
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold">Shared Component Settings</h3>
                        <SettingRow label="Total Bandwidth" unit="megabits/sec" state={bandwidth} setState={setBandwidth} />
                        <SettingRow label="Maximum Concurrent Flows" unit="flows" state={flows} setState={setFlows} />
                        <SettingRow label="Total Attacks" unit="attacks" state={attacks} setState={setAttacks} />
                    </div>

                    {/* Right Panel: Info */}
                    <div className="w-64 space-y-4">
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-[#1A1A1A] text-white p-2 text-sm font-semibold">System Information</div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="text-sm font-bold block mb-1">Name :</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold block mb-1">Description:</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded p-2 text-sm h-24 resize-none"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="text-center space-y-2 py-4 border-y border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase">Total Unique Applications</div>
                                    <div className="text-2xl font-bold">{currentAppList?.profileIds.length || 'X'}</div>
                                    <div className="text-xs text-gray-500 uppercase">Total Unique Strikes</div>
                                    <div className="text-2xl font-bold">{currentStrikeList?.strikeIds.length || 'Y'}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="lock"
                                        checked={lockToUser}
                                        onChange={e => setLockToUser(e.target.checked)}
                                    />
                                    <label htmlFor="lock" className="text-sm">Lock to this user</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                    <button onClick={resetForm} className="px-6 py-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" className="px-6 py-1.5 border border-black rounded bg-white hover:bg-gray-50 text-sm">Save</button>
                    <button type="submit" className="px-6 py-1.5 border border-black rounded bg-white hover:bg-gray-50 text-sm">Save As</button>
                    <button type="submit" className="px-6 py-1.5 bg-[#000435] text-white rounded hover:opacity-90 text-sm">Save and Run</button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex gap-6 p-6 min-h-[600px]">
            <div className="flex-1 flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">Test Cases</h2>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Enter Test Name"
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
                                <th className="p-3">Test Name</th>
                                <th className="p-3">Test ID</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Created at</th>
                                <th className="p-3">Owner</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredTestCases.map((test) => (
                                <tr
                                    key={test.id}
                                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedTestId === test.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedTestId(test.id)}
                                >
                                    <td className="p-3">{test.name}</td>
                                    <td className="p-3">{test.id}</td>
                                    <td className="p-3">{test.description}</td>
                                    <td className="p-3">{test.createdAt}</td>
                                    <td className="p-3">{test.owner}</td>
                                </tr>
                            ))}
                            {testCases.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">No test cases found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsCreating(true)} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50">New</button>
                    <button className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-400 cursor-not-allowed">Duplicate</button>
                    <button className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-400 cursor-not-allowed">Edit</button>
                    <button className="px-6 py-2 bg-[#000435] text-white rounded hover:opacity-90">Run</button>
                </div>
            </div>

            <div className="w-80 border border-gray-200 rounded p-4 bg-white flex flex-col gap-4">
                <h3 className="font-semibold border-b pb-2">
                    {selectedTest ? `${selectedTest.name} Details` : 'Test Details'}
                </h3>
                {selectedTest ? (
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm font-bold">Test ID: {selectedTest.id}</div>
                        </div>
                        <div>
                            <div className="text-sm font-bold mb-1">Application List:</div>
                            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                                {profileLists.find(l => l.id === selectedTest.applicationListId)?.profileIds.map((id: string) => (
                                    <li key={id}>{availableProfiles.find(p => p.id === id)?.name || id}</li>
                                )) || <li className="list-none -ml-4">None selected</li>}
                            </ul>
                        </div>
                        <div>
                            <div className="text-sm font-bold mb-1">Strikes:</div>
                            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                                {strikeLists.find((l: StrikeList) => l.id === selectedTest.strikeListId)?.strikeIds.map((id: string) => (
                                    <li key={id}>{availableStrikes.find(s => s.id === id)?.name || id}</li>
                                )) || <li className="list-none -ml-4">None selected</li>}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">Select a test case to see its details</p>
                )}
            </div>
        </div>
    );
}
