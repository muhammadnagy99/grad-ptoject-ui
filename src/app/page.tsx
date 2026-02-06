'use client';

import { useState } from "react";
import Image from "next/image";
import InterfaceManagement from "./interface-page";
import TestCasesView from "../components/TestCasesView";
import ApplicationProfilesView from "../components/ApplicationProfilesView";
import StrikesView from "../components/StrikesView";
import { useAuth } from "@/src/context/AuthContext";

type ViewTab = 'test-cases' | 'application-profiles' | 'strikes' | 'interfaces';

export default function Home() {
  const { user, logout } = useAuth();
  const currentUsername = user?.username || '';
  const [activeTab, setActiveTab] = useState<ViewTab>('interfaces');

  const renderContent = () => {
    switch (activeTab) {
      case 'test-cases':
        return <TestCasesView />;
      case 'application-profiles':
        return <ApplicationProfilesView />;
      case 'strikes':
        return <StrikesView />;
      case 'interfaces':
        return <InterfaceManagement />;
      default:
        return <InterfaceManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Navigation */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-[1280px] mx-auto w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-[#000435]">Traffic Generator</div>
          </div>
          <nav className="flex gap-8 items-center">
            <button
              onClick={() => setActiveTab('test-cases')}
              className={`text-sm font-medium transition-colors ${activeTab === 'test-cases' ? 'text-[#000435] border-b-2 border-[#000435]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Test Cases
            </button>
            <button
              onClick={() => setActiveTab('application-profiles')}
              className={`text-sm font-medium transition-colors ${activeTab === 'application-profiles' ? 'text-[#000435] border-b-2 border-[#000435]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Application Profiles
            </button>
            <button
              onClick={() => setActiveTab('strikes')}
              className={`text-sm font-medium transition-colors ${activeTab === 'strikes' ? 'text-[#000435] border-b-2 border-[#000435]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Strikes
            </button>
            <button
              onClick={() => setActiveTab('interfaces')}
              className={`text-sm font-medium transition-colors ${activeTab === 'interfaces' ? 'text-[#000435] border-b-2 border-[#000435]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Interfaces
            </button>

            {user && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-600"><b>{currentUsername}</b></span>
                <button onClick={logout} className="text-sm text-red-600 hover:text-red-800 underline">Logout</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto w-full flex-1">
        {renderContent()}
      </main>
    </div>
  );
}
