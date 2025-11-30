import Image from "next/image";
import InterfaceManagement from "./interface-page";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="border-b border-gray-200">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="text-lg font-medium">Name inshallah</div>
          <nav className="flex gap-8">
            <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Control Center</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Mangers</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Test</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Interfaces</a>
          </nav>
        </div>
      </header>

      <InterfaceManagement />
    </div>
  );
}
