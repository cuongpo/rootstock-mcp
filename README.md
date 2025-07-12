# 🚀 Rootstock MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

**Model Context Protocol server for Rootstock blockchain interactions**

The Rootstock MCP Server is a developer- and user-oriented backend service that enables seamless interaction with the Rootstock blockchain using the Model Context Protocol (MCP). This server provides standardized APIs for querying, transacting, and managing assets on Rootstock, making it easy for developers, users, and AI agents to build and integrate with Rootstock-based applications.

## � Try It Now

**Live Demo on Smithery:**
- 🔧 **Explore Tools**: [View all available tools](https://smithery.ai/server/@cuongpo/rootstock-mcp-test/tools)
- 💬 **Interactive Chat**: [Try it in the playground](https://smithery.ai/playground?prompt=connect%20to%20%40cuongpo%2Frootstock-mcp-test)

## �🌟 Features

### Core Capabilities
- **Standardized MCP Interface**: Expose Rootstock blockchain operations via MCP endpoints
- **Wallet Management**: Create, import, and manage multiple wallets
- **Transaction Operations**: Send native tokens and ERC20 tokens
- **ERC20 Token Deployment**: Deploy standard and mintable ERC20 tokens
- **Token Management**: Get token information and mint tokens (for mintable contracts)
- **Blockchain Queries**: Query balances, transactions, blocks, and network information
- **Smart Contract Interactions**: Call and transact with smart contracts
- **Gas Estimation**: Estimate transaction costs before sending

### Developer Tools
- **Comprehensive Documentation**: Complete API reference and examples
- **TypeScript Support**: Full type safety and IntelliSense
- **Error Handling**: Detailed error messages nd debugging information
- **Flexible Configuration**: Environment-based configuration system

## 📋 Requirements

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **Rootstock blockchain** RPC endpoint access

## 🚀 Quick Start

### 1. Installation

#### Option A: Deploy to Smithery (Recommended)
```bash
# Install Smithery CLI
npm install -g @smithery/cli

# Login to Smithery
smithery login

# Clone and deploy
git clone https://github.com/cuongpo/rootstock-mcp-server.git
cd rootstock-mcp-server
npm run build:smithery
smithery deploy
```

#### Option B: Local Installation
```bash
# Clone the repository
git clone https://github.com/cuongpo/rootstock-mcp-server.git
cd rootstock-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the configuration
nano .env
```

Configure your environment variables:

```env
# Rootstock Testnet Configuration
ROOTSTOCK_RPC_URL=https://public-node.testnet.rsk.co
ROOTSTOCK_CHAIN_ID=31
ROOTSTOCK_NETWORK_NAME=Rootstock Testnet
ROOTSTOCK_CURRENCY_SYMBOL=tRBTC
ROOTSTOCK_EXPLORER_URL=https://explorer.testnet.rootstock.io

# Wallet Configuration (comma-separated for multiple wallets)
ROOTSTOCK_PRIVATE_KEYS=your_private_key_here
ROOTSTOCK_ADDRESSES=0x742d35Cc6634C0532925a3b8D4C9db96590c6C87
ROOTSTOCK_CURRENT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96590c6C87
```

### 3. Usage

#### Standalone Mode
```bash
npm start
```

#### Development Mode
```bash
npm run dev
```

#### MCP Client Integration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "rootstock-mcp": {
      "command": "node",
      "args": ["path/to/rootstock-mcp-server/build/index.js"],
      "env": {
        "ROOTSTOCK_RPC_URL": "https://public-node.testnet.rsk.co",
        "ROOTSTOCK_CHAIN_ID": "31",
        "ROOTSTOCK_NETWORK_NAME": "Rootstock Testnet",
        "ROOTSTOCK_CURRENCY_SYMBOL": "tRBTC",
        "ROOTSTOCK_PRIVATE_KEYS": "your_private_key_here",
        "ROOTSTOCK_CURRENT_ADDRESS": "your_address_here"
      }
    }
  }
}
```

## 🛠️ Available Tools

### Wallet Management

#### `create_wallet`
Create a new wallet with a generated mnemonic phrase.

**Parameters:**
- `name` (optional): Wallet name

**Example:**
```json
{
  "name": "create_wallet",
  "arguments": {
    "name": "MyWallet"
  }
}
```

#### `import_wallet`
Import an existing wallet using private key or mnemonic.

**Parameters:**
- `privateKey` (optional): Private key to import
- `mnemonic` (optional): Mnemonic phrase to import
- `name` (optional): Wallet name

#### `list_wallets`
List all available wallets.

#### `set_current_wallet`
Set the active wallet for transactions.

**Parameters:**
- `address` (required): Wallet address

#### `get_current_wallet`
Get current active wallet information.

### Balance & Transactions

#### `get_balance`
Get wallet balance (native or ERC20 tokens).

**Parameters:**
- `address` (required): Wallet address
- `tokenAddress` (optional): ERC20 token contract address

#### `send_transaction`
Send native tokens or ERC20 tokens.

**Parameters:**
- `to` (required): Recipient address
- `amount` (required): Amount to send
- `tokenAddress` (optional): ERC20 token contract address
- `gasLimit` (optional): Gas limit
- `gasPrice` (optional): Gas price

#### `get_transaction`
Get transaction details by hash.

**Parameters:**
- `hash` (required): Transaction hash

### Blockchain Queries

#### `get_block`
Get block information.

**Parameters:**
- `blockNumber` (optional): Block number
- `blockHash` (optional): Block hash

#### `get_network_info`
Get current network information and status.

#### `estimate_gas`
Estimate gas cost for a transaction.

**Parameters:**
- `to` (required): Recipient address
- `value` (optional): Value to send
- `data` (optional): Transaction data

### Smart Contracts

#### `call_contract`
Call a smart contract method (read-only).

**Parameters:**
- `contractAddress` (required): Contract address
- `methodName` (required): Method name
- `parameters` (optional): Method parameters
- `abi` (optional): Contract ABI

#### `send_contract_transaction`
Send a transaction to a smart contract.

**Parameters:**
- `contractAddress` (required): Contract address
- `methodName` (required): Method name
- `parameters` (optional): Method parameters
- `abi` (optional): Contract ABI
- `value` (optional): Ether value to send
- `gasLimit` (optional): Gas limit
- `gasPrice` (optional): Gas price

### ERC20 Token Management

#### `deploy_erc20_token`
Deploy a new ERC20 token contract.

**Parameters:**
- `name` (required): Token name (e.g., "My Token")
- `symbol` (required): Token symbol (e.g., "MTK")
- `decimals` (optional): Token decimals (default: 18)
- `initialSupply` (required): Initial token supply
- `mintable` (optional): Whether the token should be mintable (default: false)
- `gasLimit` (optional): Gas limit
- `gasPrice` (optional): Gas price

**Example:**
```json
{
  "name": "deploy_erc20_token",
  "arguments": {
    "name": "My Token",
    "symbol": "MTK",
    "decimals": 18,
    "initialSupply": "1000000",
    "mintable": true
  }
}
```

#### `get_token_info`
Get information about an ERC20 token.

**Parameters:**
- `tokenAddress` (required): ERC20 token contract address

**Example:**
```json
{
  "name": "get_token_info",
  "arguments": {
    "tokenAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
  }
}
```

#### `mint_tokens`
Mint tokens (only for mintable tokens).

**Parameters:**
- `tokenAddress` (required): ERC20 token contract address
- `to` (required): Address to mint tokens to
- `amount` (required): Amount of tokens to mint
- `gasLimit` (optional): Gas limit
- `gasPrice` (optional): Gas price

**Example:**
```json
{
  "name": "mint_tokens",
  "arguments": {
    "tokenAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "1000"
  }
}
```

## 🏗️ Development

### Project Structure

```
rootstock-mcp-server/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── rootstock-client.ts   # Blockchain client
│   ├── wallet-manager.ts     # Wallet management
│   └── types.ts              # Type definitions
├── build/                    # Compiled JavaScript
├── docs/                     # Documentation
├── examples/                 # Example code
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

```bash
# Development
npm run dev          # Run in development mode
npm run build        # Build TypeScript
npm run start        # Run built version

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm test            # Run tests
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔒 Security

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use `.env` files for sensitive configuration
- **Network Security**: Use HTTPS endpoints in production
- **Wallet Security**: Store mnemonic phrases securel
## 📚 Documentation

- [API Reference](docs/api.md)
- [Configuration Guide](docs/configuration.md)
- [Examples](examples/)
- [Troubleshooting](docs/troubleshooting.md)

## 🤝 Community

- **Developers**: Contribute to backend or frontend development, API design, or documentation
- **Testers**: Help stress-test the gateway, identify bugs, and provide UX feedback
- **Content Creators**: Assist with user guides, tutorials, and community outreach
- **Community Support**: Help onboard new users and foster engagement

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the standardized interface
- [Ethers.js](https://ethers.org/) for Ethereum interactions
- The Rootstock blockchain community
