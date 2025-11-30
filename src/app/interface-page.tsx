'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import IFICOM from '@/public/network-interface.svg'
import Image from 'next/image';
// Types
interface NetworkInterface {
    id: string;
    name: string;
    status: 'assigned' | 'unassigned';
    ip?: string;
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

// Mock data
const mockInterfaces: NetworkInterface[] = [
    { id: '0', name: 'eth0', status: 'unassigned' },
    { id: '1', name: 'eth1', status: 'unassigned' },
    { id: '2', name: 'eth2', status: 'assigned', ip: '192.168.1.10', gateway: '192.168.1.1' },
    { id: '3', name: 'eth3', status: 'unassigned' },
    { id: '4', name: 'eth4', status: 'assigned', ip: '10.0.0.5', gateway: '10.0.0.1' },
    { id: '5', name: 'eth5', status: 'unassigned' },
    { id: '6', name: 'eth6', status: 'unassigned' },
];

export default function InterfaceManagement() {
    const [interfaces, setInterfaces] = useState<NetworkInterface[]>(mockInterfaces);
    const [showPortConfig, setShowPortConfig] = useState<boolean>(false);
    const [showPortMapping, setShowPortMapping] = useState<boolean>(false);
    const [showAssignOverlay, setShowAssignOverlay] = useState<boolean>(false);
    const [selectedInterface, setSelectedInterface] = useState<NetworkInterface | null>(null);
    const [selectedFromAvailable, setSelectedFromAvailable] = useState<NetworkInterface | null>(null);
    const [selectedFromAssigned, setSelectedFromAssigned] = useState<NetworkInterface | null>(null);
    const [assignFormData, setAssignFormData] = useState<AssignFormData>({ port: '', ip: '', gateway: '' });
    const [configFormData, setConfigFormData] = useState<ConfigFormData>({ portNo: '', ip: '', gateway: '' });

    const availableInterfaces = interfaces.filter(i => i.status === 'unassigned');
    const assignedInterfaces = interfaces.filter(i => i.status === 'assigned');

    const handlePortConfigSave = (): void => {
        console.log('Port config saved:', configFormData);
        setShowPortConfig(false);
        setConfigFormData({ portNo: '', ip: '', gateway: '' });
    };

    const handleMoveToAssigned = (): void => {
        if (!selectedFromAvailable) return;
        setAssignFormData({ port: selectedFromAvailable.name, ip: '', gateway: '' });
        setShowAssignOverlay(true);
    };

    const handleAssign = (): void => {
        if (!selectedFromAvailable) return;

        setInterfaces(prev => prev.map(i =>
            i.id === selectedFromAvailable.id
                ? { ...i, status: 'assigned' as const, ip: assignFormData.ip, gateway: assignFormData.gateway }
                : i
        ));

        setShowAssignOverlay(false);
        setSelectedFromAvailable(null);
        setAssignFormData({ port: '', ip: '', gateway: '' });
    };

    const handleMoveToAvailable = (): void => {
        if (!selectedFromAssigned) return;

        setInterfaces(prev => prev.map(i =>
            i.id === selectedFromAssigned.id
                ? { ...i, status: 'unassigned' as const, ip: undefined, gateway: undefined }
                : i
        ));

        setSelectedFromAssigned(null);
    };

    const handleInterfaceClick = (iface: NetworkInterface): void => {
        setSelectedFromAvailable(iface);
        setAssignFormData({ port: iface.name, ip: iface.ip || '', gateway: iface.gateway || '' });
        setShowAssignOverlay(true);
    };

    return (
        <>
            {/* Main Content */}
            <div className="px-8 py-6">
                <div className="text-center text-gray-600 mb-6">User's IP address</div>

                {/* Interfaces Grid */}
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                    <div className="grid grid-cols-4 gap-6">
                        {interfaces.map((iface) => (
                            <div
                                key={iface.id}
                                onClick={() => handleInterfaceClick(iface)}
                                className="bg-white border border-gray-300 rounded p-6 flex flex-col items-center relative cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-16 h-16 mb-3 rounded flex items-center justify-center">
                                   <Image src={IFICOM} width={64} height={64} alt='' />
                                </div>
                                <div className="text-sm text-gray-500 mb-1 absolute left-6 top-6">{iface.id}</div>
                                <div className="text-center">
                                    <div className="font-medium">{iface.name}</div>
                                    <div className="text-sm text-gray-500 capitalize">{iface.status}</div>
                                    {iface.ip && <div className="text-xs text-gray-400 mt-1">{iface.ip}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setShowPortMapping(true)}
                        className="px-8 py-2 bg-white border-2 border-gray-900 rounded hover:bg-gray-50"
                    >
                        Port Mapping
                    </button>
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
                                    {interfaces.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
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

            {/* Port Mapping Overlay */}
            {showPortMapping && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 max-w-5xl w-full relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Port Mapping</h2>
                            <button onClick={() => {
                                setShowPortMapping(false);
                                setSelectedFromAvailable(null);
                                setSelectedFromAssigned(null);
                            }}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="text-sm text-gray-600 mb-6">
                            Any changes in the ports configuration will cause a server restart
                        </div>

                        <div className="flex gap-6 items-center">
                            {/* Available Interfaces */}
                            <div className="flex-1 border-2 border-gray-300 rounded p-4">
                                <h3 className="text-center font-medium mb-4 pb-2 border-b">Available Interfaces</h3>
                                <div className="space-y-2 min-h-[300px]">
                                    {availableInterfaces.map((iface) => (
                                        <div
                                            key={iface.id}
                                            onClick={() => setSelectedFromAvailable(iface)}
                                            className={`p-3 border rounded cursor-pointer ${selectedFromAvailable?.id === iface.id
                                                ? 'bg-blue-100 border-blue-500'
                                                : 'bg-white border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {iface.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Arrow Buttons */}
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleMoveToAssigned}
                                    disabled={!selectedFromAvailable}
                                    className="p-3 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleMoveToAvailable}
                                    disabled={!selectedFromAssigned}
                                    className="p-3 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Assigned Interfaces */}
                            <div className="flex-1 border-2 border-gray-300 rounded p-4">
                                <h3 className="text-center font-medium mb-4 pb-2 border-b">Assigned Interfaces</h3>
                                <div className="space-y-2 min-h-[300px]">
                                    {assignedInterfaces.map((iface) => (
                                        <div
                                            key={iface.id}
                                            onClick={() => setSelectedFromAssigned(iface)}
                                            className={`p-3 border rounded cursor-pointer ${selectedFromAssigned?.id === iface.id
                                                ? 'bg-blue-100 border-blue-500'
                                                : 'bg-white border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-medium">{iface.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{iface.ip}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
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