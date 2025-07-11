# Rootstock MCP Server - Smithery Deployment Guide

This guide covers deploying the Rootstock MCP Server to Smithery with full ERC20 token deployment capabilities.

## 🚀 Quick Deploy to Smithery

### Prerequisites
- [Smithery CLI](https://smithery.ai/docs/cli) installed
- Node.js 18+ installed
- Git repository access

### 1. Install Smithery CLI
```bash
npm install -g @smithery/cli
```

### 2. Login to Smithery
```bash
smithery login
```

### 3. Deploy the Server
```bash
# Clone the repository
git clone https://github.com/cuongpo/rootstock-mcp-server
cd rootstock-mcp-server

# Build for Smithery
npm run build:smithery

# Deploy to Smithery
smithery deploy
```

## 🔧 Configuration

### Environment Variables
The server requires these environment variables:

**Required:**
- `ROOTSTOCK_RPC_URL`: Rootstock testnet RPC endpoint
  - Default: `https://public-node.testnet.rsk.co`

**Optional:**
- `ROOTSTOCK_CHAIN_ID`: Chain ID (default: 31)
- `ROOTSTOCK_NETWORK_NAME`: Network name (default: "Rootstock Testnet")
- `ROOTSTOCK_CURRENCY_SYMBOL`: Currency symbol (default: "tRBTC")
- `ROOTSTOCK_EXPLORER_URL`: Block explorer URL
- `ROOTSTOCK_PRIVATE_KEYS`: Comma-separated private keys for wallets
- `ROOTSTOCK_ADDRESSES`: Comma-separated wallet addresses
- `ROOTSTOCK_CURRENT_ADDRESS`: Default active wallet address

### Smithery Configuration
The `smithery.yaml` file includes:
- Complete tool definitions with parameters
- ERC20 token deployment tools
- Wallet management tools
- Transaction and query tools
- Smart contract interaction tools

## 🛠️ Available Tools

### Wallet Management
- `create_wallet`: Create new wallets with generated mnemonics
- `import_wallet`: Import wallets using private keys or mnemonics
- `list_wallets`: List all available wallets
- `set_current_wallet`: Switch active wallet
- `get_current_wallet`: Get current wallet info

### Balance & Transactions
- `get_balance`: Get wallet balance (native or ERC20)
- `get_native_balance`: Get native tRBTC balance
- `send_transaction`: Send native tokens or ERC20 tokens
- `get_transaction`: Get transaction details
- `estimate_gas`: Estimate transaction costs

### ERC20 Token Tools
- `deploy_erc20_token`: Deploy new ERC20 contracts (standard or mintable)
- `get_token_info`: Get comprehensive token information
- `mint_tokens`: Mint tokens for mintable contracts

### Smart Contracts
- `call_contract`: Call contract methods (read-only)
- `send_contract_transaction`: Send transactions to contracts

### Blockchain Queries
- `get_block`: Get block information
- `get_network_info`: Get network status

## 📝 Usage Examples

### Deploy an ERC20 Token
```javascript
await mcp.callTool('deploy_erc20_token', {
  name: 'My Token',
  symbol: 'MTK',
  decimals: 18,
  initialSupply: '1000000',
  mintable: true
});
```

### Get Token Information
```javascript
await mcp.callTool('get_token_info', {
  tokenAddress: '0x6985a7B50b0Cbdc9d4413ad35d6ffB787eC43fA8'
});
```

### Mint Tokens
```javascript
await mcp.callTool('mint_tokens', {
  tokenAddress: '0x6985a7B50b0Cbdc9d4413ad35d6ffB787eC43fA8',
  to: '0x1234567890123456789012345678901234567890',
  amount: '1000'
});
```

## 🔗 Live Examples

The server includes working examples on Rootstock testnet:

**Deployed Tokens:**
- SimpleERC20: `0x1Da93d721A24B5017e5B7680C20B86666d57df24`
- MintableERC20: `0x6985a7B50b0Cbdc9d4413ad35d6ffB787eC43fA8`

**Explorer:** https://explorer.testnet.rootstock.io

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t rootstock-mcp-server .
```

### Run Container
```bash
docker run -p 3000:3000 \
  -e ROOTSTOCK_RPC_URL=https://public-node.testnet.rsk.co \
  rootstock-mcp-server
```

## 🔍 Features

### ✅ Complete ERC20 Support
- Deploy standard and mintable ERC20 tokens
- Real contract deployment (no mocks)
- Rootstock-compatible bytecode
- OpenZeppelin-based contracts

### ✅ Explorer Integration
- Direct links to transactions
- Contract verification links
- Real-time transaction tracking

### ✅ Production Ready
- Type-safe TypeScript implementation
- Comprehensive error handling
- Gas estimation and optimization
- Multi-wallet support

### ✅ Developer Friendly
- Detailed tool documentation
- Parameter validation
- Clear error messages
- Example usage patterns

## 📚 Documentation

- [Smithery Documentation](https://smithery.ai/docs)
- [Project Repository](https://github.com/cuongpo/rootstock-mcp-server)
- [Rootstock Testnet](https://public-node.testnet.rsk.co)

## 🆘 Support

- [GitHub Issues](https://github.com/cuongpo/rootstock-mcp-server/issues)
- [GitHub Discussions](https://github.com/cuongpo/rootstock-mcp-server/discussions)
- [Smithery Community](https://smithery.ai/community)
