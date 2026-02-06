'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Lock } from 'lucide-react'; // Added Lock icon
import IFICOM from '@/public/network-interface.svg'
import IFICOMD from '@/public/network-interface-dark.svg'

import Image from 'next/image';

// Types matching backend response
interface NetworkInterface {
    ifname: string;
    active: boolean;
    assigned_to: string | null;
    driver: string;
    mac: string;
    pci: string;
    reserved: boolean;
    reserved_by: string | null;
    slot: string;
    // Helper for UI compatibility if needed, though we'll use ifname as ID/Name mostly
    ip?: string; // Kept for types, though backend might not send it yet? Sample didn't show IP.
    gateway?: string;
}

interface AssignFormData {
    port: string;
    ip: string;
    gateway: string;
}

interface ConfigFormData {
    portNo: string;
    ip: string;
    gateway: string;
}

// Removed hardcoded CURRENT_USER
// const CURRENT_USER = 'user0003';

import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InterfaceManagement() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const currentUsername = user?.username || '';

    // Redirect if not logged in (optional but good for demo)
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showPortConfig, setShowPortConfig] = useState<boolean>(false);
    const [showPortMapping, setShowPortMapping] = useState<boolean>(false);
    const [showAssignOverlay, setShowAssignOverlay] = useState<boolean>(false);
    const [showUnassignConfirmation, setShowUnassignConfirmation] = useState<boolean>(false);

    // selectedFromAvailable might refer to an unassigned interface
    const [selectedFromAvailable, setSelectedFromAvailable] = useState<NetworkInterface | null>(null);

    // selectedFromAssigned might refer to an interface assigned to CURRENT_USER
    const [selectedFromAssigned, setSelectedFromAssigned] = useState<NetworkInterface | null>(null);

    const [assignFormData, setAssignFormData] = useState<AssignFormData>({ port: '', ip: '', gateway: '' });
    const [configFormData, setConfigFormData] = useState<ConfigFormData>({ portNo: '', ip: '', gateway: '' });

    useEffect(() => {
        fetchInterfaces();
    }, []);

    const fetchInterfaces = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/interfaces');
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                setInterfaces(result.data);
            } else {
                console.error('Unexpected API response structure:', result);
                setError('Failed to load interfaces: Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching interfaces:', err);
            setError('Failed to load interfaces');
        } finally {
            setLoading(false);
        }
    };

    // Filter available: Not assigned to anyone
    const availableInterfaces = interfaces.filter(i => i.assigned_to === null);

    // Filter assigned to ME:
    const myAssignedInterfaces = interfaces.filter(i => i.assigned_to === currentUsername);

    const handlePortConfigSave = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch('/api/interfaces/update-ips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUsername,
                    interface: configFormData.portNo, // Use the selected interface name/id
                    ip: configFormData.ip,
                    gateway: configFormData.gateway
                })
            });

            const result = await response.json();
            if (result.success) {
                console.log('Port config saved:', result);
                setShowPortConfig(false);
                setConfigFormData({ portNo: '', ip: '', gateway: '' });
                await fetchInterfaces(); // Refresh data
            } else {
                setError(`Configuration failed: ${result.error}`);
            }
        } catch (err) {
            console.error('Error saving config:', err);
            setError('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleMoveToAssigned = (): void => {
        if (!selectedFromAvailable) return;
        setAssignFormData({ port: selectedFromAvailable.ifname, ip: '', gateway: '' });
        setShowAssignOverlay(true);
    };

    // In real implementation, this calls the API
    const handleAssign = async (): Promise<void> => {
        if (!selectedFromAvailable) return;

        try {
            setLoading(true);
            // Assuming we use ifname or pci for assignment. 
            // Protocol uses "interfaces" array. 
            // Using 'pci' based on plan and assumption, fallback to 'ifname' if pci missing?
            // The type has pci, so we use it.
            const interfaceId = selectedFromAvailable.pci || selectedFromAvailable.ifname;

            const response = await fetch('/api/interfaces/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interfaces: [interfaceId],
                    user_id: currentUsername,
                    ips: [assignFormData.ip],
                    gateways: [assignFormData.gateway]
                })
            });

            const result = await response.json();
            if (result.success) {
                setShowAssignOverlay(false);
                setSelectedFromAvailable(null);
                setAssignFormData({ port: '', ip: '', gateway: '' });
                await fetchInterfaces(); // Refresh list to get new status
            } else {
                setError(`Assignment failed: ${result.error}`);
            }
        } catch (err) {
            console.error('Error assigning interface:', err);
            setError('Failed to assign interface');
        } finally {
            setLoading(false);
        }
    };

    // Unassign logic
    const handleUnassign = async (): Promise<void> => {
        if (!selectedFromAssigned) return;

        try {
            setLoading(true);
            const interfaceId = selectedFromAssigned.pci || selectedFromAssigned.ifname;

            const response = await fetch('/api/interfaces/unassign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interfaces: [interfaceId]
                })
            });

            const result = await response.json();
            if (result.success) {
                setShowUnassignConfirmation(false);
                setSelectedFromAssigned(null);
                await fetchInterfaces(); // Refresh list
            } else {
                setError(`Unassignment failed: ${result.error}`);
            }
        } catch (err) {
            console.error('Error unassigning interface:', err);
            setError('Failed to unassign interface');
        } finally {
            setLoading(false);
        }
    };

    const handleInterfaceClick = (iface: NetworkInterface): void => {
        // If assigned to someone else, do nothing (locked)
        if (iface.assigned_to && iface.assigned_to !== currentUsername) {
            return;
        }

        // If assigned to me, show unassign confirmation
        if (iface.assigned_to === currentUsername) {
            setSelectedFromAssigned(iface);
            setShowUnassignConfirmation(true);
            return;
        }

        // If unassigned, open assign overlay
        if (!iface.assigned_to) {
            setSelectedFromAvailable(iface);
            setAssignFormData({ port: iface.ifname, ip: iface.ip || '', gateway: iface.gateway || '' });
            setShowAssignOverlay(true);
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    if (!user) return null; // Or some fallback UI although redirect handles it

    return (
        <>
            {/* Header / Top Bar for User Info (Optional but helpful) */}


            {/* Main Content */}
            <div className="px-8 py-6">
                <div className="text-center text-gray-600 mb-6">User's IP address</div>

                {/* Interfaces Grid */}
                <div className=" rounded-lg p-8 mb-6">
                    <div className="grid grid-cols-4 gap-6">
                        {interfaces.map((iface) => {
                            const isAssigned = iface.assigned_to !== null;
                            const isMyInterface = iface.assigned_to === currentUsername;
                            const isLocked = isAssigned && !isMyInterface;

                            return (
                                <div
                                    key={iface.ifname} // Use ifname as unique key
                                    onClick={() => handleInterfaceClick(iface)}
                                    className={`
                        border border-gray-300 rounded p-6 flex flex-col items-center relative transition-colors
                        ${isLocked ? 'cursor-not-allowed opacity-75 bg-gray-100' : 'cursor-pointer'}
                        ${!isLocked && isAssigned
                                            ? 'bg-[#000435] text-white'
                                            : !isLocked ? 'bg-[#D9D9D9] hover:bg-gray-50' : ''
                                        }
                    `}
                                >
                                    {isLocked && (
                                        <div className="absolute top-2 right-2 text-gray-500">
                                            <Lock size={16} />
                                        </div>
                                    )}

                                    <div className="w-16 h-16 mb-3 rounded flex items-center justify-center">
                                        <Image
                                            src={(!isLocked && isAssigned) ? IFICOMD : IFICOM}
                                            width={64}
                                            height={64}
                                            alt=''
                                        />
                                    </div>

                                    {/* ID Label (PCI slot or ifname ID maybe? using active/reserved status for now or index) */}
                                    <div className={`text-sm mb-1 absolute left-6 top-6 ${(!isLocked && isAssigned) ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {/* Using last part of pci or similar as generic ID if needed, or just index? 
                                            Mock had '0', '1'. We can format ifname. 
                                        */}
                                        {iface.ifname.replace(/[a-z]/g, '')}
                                    </div>

                                    <div className="text-center">
                                        <div className="font-medium">{iface.ifname}</div>

                                        {/* Status Label */}
                                        <div className={`text-sm capitalize ${(!isLocked && isAssigned) ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {iface.active ? 'Active' : 'Inactive'}
                                        </div>

                                        {/* Assigned To Label */}
                                        {iface.assigned_to && (
                                            <div className={`text-xs mt-1 font-semibold ${(!isLocked && isAssigned) ? 'text-blue-200' : 'text-gray-600'}`}>
                                                {isMyInterface ? '(You)' : iface.assigned_to}
                                            </div>
                                        )}

                                        {/* IP Label - Backend doesn't send IP in sample, but if it did: */}
                                        {iface.ip && (
                                            <div className={`text-xs mt-1 ${(!isLocked && isAssigned) ? 'text-gray-400' : 'text-gray-400'}`}>
                                                {iface.ip}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setShowPortConfig(true)}
                        className="px-8 py-2 bg-white border-2 border-gray-900 rounded hover:bg-gray-50"
                    >
                        Port Configuration
                    </button>
                    <button className="px-8 py-2 bg-gray-200 border-2 border-gray-300 rounded text-gray-400 cursor-not-allowed">
                        Packet Export
                    </button>
                </div>
            </div>

            {/* Port Configuration Overlay */}
            {showPortConfig && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 max-w-md w-full relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Port Configuration</h2>
                            <button onClick={() => setShowPortConfig(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="text-sm text-gray-600 mb-6">
                            Any changes in the ports configuration will cause a server restart
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2">Port no.</label>
                                <select
                                    className="w-full border border-gray-300 rounded p-3"
                                    value={configFormData.portNo}
                                    onChange={(e) => setConfigFormData({ ...configFormData, portNo: e.target.value })}
                                >
                                    <option value="">Select port</option>
                                    {interfaces.map(i => <option key={i.ifname} value={i.ifname}>{i.ifname}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2">IP:</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-3"
                                    value={configFormData.ip}
                                    onChange={(e) => setConfigFormData({ ...configFormData, ip: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block mb-2">Gateway:</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-3"
                                    value={configFormData.gateway}
                                    onChange={(e) => setConfigFormData({ ...configFormData, gateway: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handlePortConfigSave}
                                className="w-full mt-6 px-6 py-3 bg-white border-2 border-gray-900 rounded-full hover:bg-gray-100"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unassign Confirmation Overlay */}
            {showUnassignConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 max-w-sm w-full relative z-10 text-center">
                        <h2 className="text-lg font-semibold mb-4">Unassign Interface?</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to unassign this interface?</p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setShowUnassignConfirmation(false)}
                                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                No
                            </button>
                            <button
                                onClick={handleUnassign}
                                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Overlay */}
            {showAssignOverlay && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 max-w-md w-full relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Assign Interface</h2>
                            <button onClick={() => {
                                setShowAssignOverlay(false);
                                setSelectedFromAvailable(null);
                                setAssignFormData({ port: '', ip: '', gateway: '' });
                            }}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2">Port</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-3 bg-gray-50"
                                    value={assignFormData.port}
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block mb-2">IP:</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-3"
                                    value={assignFormData.ip}
                                    onChange={(e) => setAssignFormData({ ...assignFormData, ip: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block mb-2">Gateway:</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-3"
                                    value={assignFormData.gateway}
                                    onChange={(e) => setAssignFormData({ ...assignFormData, gateway: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleAssign}
                                className="w-full mt-6 px-6 py-3 bg-white border-2 border-gray-900 rounded-full hover:bg-gray-100"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}