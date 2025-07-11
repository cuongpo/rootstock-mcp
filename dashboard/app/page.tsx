'use client'

import { useState, useEffect } from 'react'
import { WalletCard } from './components/WalletCard'
import { TransactionForm } from './components/TransactionForm'
import { NetworkInfo } from './components/NetworkInfo'
import { TransactionHistory } from './components/TransactionHistory'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('wallet')
  const [wallets, setWallets] = useState([])
  const [currentWallet, setCurrentWallet] = useState(null)
  const [networkInfo, setNetworkInfo] = useState(null)

  useEffect(() => {
    // Initialize dashboard data
    loadWallets()
    loadNetworkInfo()
  }, [])

  const loadWallets = async () => {
    // This would connect to your MCP server
    // For now, we'll use mock data
    setWallets([
      {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        balance: '1.234',
        name: 'Main Wallet'
      }
    ])
  }

  const loadNetworkInfo = async () => {
    // This would connect to your MCP server
    setNetworkInfo({
      networkName: 'Hyperion',
      chainId: 1,
      blockNumber: 12345678,
      gasPrice: '20',
      isConnected: true
    })
  }

  const tabs = [
    { id: 'wallet', name: 'Wallet', icon: '💼' },
    { id: 'send', name: 'Send', icon: '📤' },
    { id: 'history', name: 'History', icon: '📋' },
    { id: 'network', name: 'Network', icon: '🌐' },
  ]

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your Hyperion blockchain interactions
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'wallet' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Wallet Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallets.map((wallet, index) => (
                <WalletCard
                  key={index}
                  wallet={wallet}
                  isActive={currentWallet?.address === wallet.address}
                  onSelect={setCurrentWallet}
                />
              ))}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  + Create New Wallet
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Generate a new wallet
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Send Transaction
            </h3>
            <TransactionForm currentWallet={currentWallet} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Transaction History
            </h3>
            <TransactionHistory currentWallet={currentWallet} />
          </div>
        )}

        {activeTab === 'network' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Network Information
            </h3>
            <NetworkInfo networkInfo={networkInfo} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">Quick Balance Check</h4>
          <p className="text-sm text-blue-700 mt-1">
            Check your wallet balance instantly
          </p>
          <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
            Check Balance →
          </button>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900">Send Test Transaction</h4>
          <p className="text-sm text-green-700 mt-1">
            Send a small test transaction
          </p>
          <button className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium">
            Send Test →
          </button>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900">API Documentation</h4>
          <p className="text-sm text-purple-700 mt-1">
            View MCP server documentation
          </p>
          <button className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium">
            View Docs →
          </button>
        </div>
      </div>
    </div>
  )
}
