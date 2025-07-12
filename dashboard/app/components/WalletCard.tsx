'use client'

interface Wallet {
  address: string
  balance: string
  name?: string
}

interface WalletCardProps {
  wallet: Wallet
  isActive: boolean
  onSelect: (wallet: Wallet) => void
}

export function WalletCard({ wallet, isActive, onSelect }: WalletCardProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={() => onSelect(wallet)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">
          {wallet.name || 'Unnamed Wallet'}
        </h4>
        {isActive && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Active
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">Address</p>
          <p className="text-sm font-mono text-gray-900">
            {truncateAddress(wallet.address)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500">Balance</p>
          <p className="text-lg font-semibold text-gray-900">
            {wallet.balance} tRBTC
          </p>
        </div>
      </div>
      
      <div className="mt-3 flex space-x-2">
        <button className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded">
          Copy Address
        </button>
        <button className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded">
          View Details
        </button>
      </div>
    </div>
  )
}
