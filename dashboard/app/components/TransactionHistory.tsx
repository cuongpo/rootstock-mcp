'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: 'confirmed' | 'pending' | 'failed'
  type: 'sent' | 'received'
}

interface TransactionHistoryProps {
  currentWallet: any
}

export function TransactionHistory({ currentWallet }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'sent', 'received'

  useEffect(() => {
    if (currentWallet) {
      loadTransactionHistory()
    }
  }, [currentWallet])

  const loadTransactionHistory = async () => {
    setIsLoading(true)
    try {
      // This would call your MCP server
      // For now, we'll use mock data
      const mockTransactions: Transaction[] = [
        {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          from: currentWallet.address,
          to: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
          value: '0.5',
          timestamp: Date.now() - 3600000,
          status: 'confirmed',
          type: 'sent'
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          from: '0x1111111111111111111111111111111111111111111111111111111111111111',
          to: currentWallet.address,
          value: '1.0',
          timestamp: Date.now() - 7200000,
          status: 'confirmed',
          type: 'received'
        },
        {
          hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
          from: currentWallet.address,
          to: '0x2222222222222222222222222222222222222222222222222222222222222222',
          value: '0.1',
          timestamp: Date.now() - 10800000,
          status: 'pending',
          type: 'sent'
        }
      ]
      
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Failed to load transaction history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'sent' ? '📤' : '📥'
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.type === filter
  })

  if (!currentWallet) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please select a wallet to view transaction history</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {['all', 'sent', 'received'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                filter === filterType
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
        
        <button
          onClick={loadTransactionHistory}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.hash}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTypeIcon(tx.type)}</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {tx.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(tx.timestamp)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Hash</p>
                  <p className="font-mono text-gray-900">{truncateHash(tx.hash)}</p>
                </div>
                
                <div>
                  <p className="text-gray-500">
                    {tx.type === 'sent' ? 'To' : 'From'}
                  </p>
                  <p className="font-mono text-gray-900">
                    {truncateAddress(tx.type === 'sent' ? tx.to : tx.from)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {tx.value} ETH
                  </p>
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded">
                  Copy Hash
                </button>
                <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded">
                  View on Explorer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
