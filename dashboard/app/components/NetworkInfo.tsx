'use client'

interface NetworkInfoProps {
  networkInfo: {
    networkName: string
    chainId: number
    blockNumber: number
    gasPrice: string
    isConnected: boolean
  } | null
}

export function NetworkInfo({ networkInfo }: NetworkInfoProps) {
  if (!networkInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading network information...</p>
      </div>
    )
  }

  const formatGasPrice = (gasPrice: string) => {
    const gwei = parseInt(gasPrice) / 1e9
    return `${gwei.toFixed(2)} Gwei`
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${networkInfo.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`font-medium ${networkInfo.isConnected ? 'text-green-700' : 'text-red-700'}`}>
          {networkInfo.isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Network Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Network Name
            </h4>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {networkInfo.networkName}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Chain ID
            </h4>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {networkInfo.chainId}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Latest Block
            </h4>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              #{networkInfo.blockNumber.toLocaleString()}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Gas Price
            </h4>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatGasPrice(networkInfo.gasPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Network Actions */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Network Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium">
            Refresh Network Info
          </button>
          <button className="px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm font-medium">
            Check Connection
          </button>
          <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-sm font-medium">
            View Block Explorer
          </button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Network Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {networkInfo.blockNumber.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Blocks</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {formatGasPrice(networkInfo.gasPrice)}
            </p>
            <p className="text-xs text-gray-500">Avg Gas Price</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {networkInfo.isConnected ? '100%' : '0%'}
            </p>
            <p className="text-xs text-gray-500">Uptime</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              ~15s
            </p>
            <p className="text-xs text-gray-500">Block Time</p>
          </div>
        </div>
      </div>
    </div>
  )
}
