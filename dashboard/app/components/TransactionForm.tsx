'use client'

import { useState } from 'react'

interface TransactionFormProps {
  currentWallet: any
}

export function TransactionForm({ currentWallet }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    tokenAddress: '',
    gasLimit: '',
    gasPrice: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState('native') // 'native' or 'token'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentWallet) {
      alert('Please select a wallet first')
      return
    }

    setIsLoading(true)
    try {
      // This would call your MCP server
      console.log('Sending transaction:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Transaction sent successfully!')
      setFormData({
        to: '',
        amount: '',
        tokenAddress: '',
        gasLimit: '',
        gasPrice: ''
      })
    } catch (error) {
      alert('Failed to send transaction: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!currentWallet) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please select a wallet to send transactions</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="native">Native Token (tRBTC)</option>
          <option value="token">ERC20 Token</option>
        </select>
      </div>

      {/* From Wallet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          From Wallet
        </label>
        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
          <p className="text-sm font-mono text-gray-900">
            {currentWallet.address}
          </p>
          <p className="text-xs text-gray-500">
            Balance: {currentWallet.balance} tRBTC
          </p>
        </div>
      </div>

      {/* To Address */}
      <div>
        <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
          To Address *
        </label>
        <input
          type="text"
          id="to"
          name="to"
          value={formData.to}
          onChange={handleInputChange}
          placeholder="0x..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Token Address (for ERC20) */}
      {transactionType === 'token' && (
        <div>
          <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Token Contract Address *
          </label>
          <input
            type="text"
            id="tokenAddress"
            name="tokenAddress"
            value={formData.tokenAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount *
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          placeholder="0.0"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Advanced Options */}
      <details className="border border-gray-200 rounded-md">
        <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
          Advanced Options
        </summary>
        <div className="px-3 py-2 border-t border-gray-200 space-y-4">
          <div>
            <label htmlFor="gasLimit" className="block text-sm font-medium text-gray-700 mb-2">
              Gas Limit
            </label>
            <input
              type="text"
              id="gasLimit"
              name="gasLimit"
              value={formData.gasLimit}
              onChange={handleInputChange}
              placeholder="21000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="gasPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Gas Price (wei)
            </label>
            <input
              type="text"
              id="gasPrice"
              name="gasPrice"
              value={formData.gasPrice}
              onChange={handleInputChange}
              placeholder="20000000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </details>

      {/* Submit Button */}
      <div className="flex space-x-3">
        <button
          type="button"
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Estimate Gas
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Transaction'}
        </button>
      </div>
    </form>
  )
}
