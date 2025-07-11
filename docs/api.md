# Rootstock MCP Server API Reference

This document provides detailed information about all available tools in the Rootstock MCP Server.

## Table of Contents

- [Wallet Management](#wallet-management)
- [Balance & Transactions](#balance--transactions)
- [Blockchain Queries](#blockchain-queries)
- [Smart Contracts](#smart-contracts)
- [Utilities](#utilities)

## Wallet Management

### create_wallet

Creates a new wallet with a generated mnemonic phrase.

**Parameters:**
- `name` (optional, string): Human-readable name for the wallet

**Returns:**
- Wallet address
- Generated mnemonic phrase (store securely!)
- Success message

**Example:**
```json
{
  "name": "create_wallet",
  "arguments": {
    "name": "MyMainWallet"
  }
}
```

### import_wallet

Imports an existing wallet using either a private key or mnemonic phrase.

**Parameters:**
- `privateKey` (optional, string): Private key in hex format
- `mnemonic` (optional, string): 12 or 24-word mnemonic phrase
- `name` (optional, string): Human-readable name for the wallet

**Note:** Either `privateKey` or `mnemonic` must be provided.

**Returns:**
- Wallet address
- Success message

**Example:**
```json
{
  "name": "import_wallet",
  "arguments": {
    "mnemonic": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    "name": "ImportedWallet"
  }
}
```

### list_wallets

Lists all available wallets in the system.

**Parameters:** None

**Returns:**
- Array of wallet addresses
- Current active wallet indicator

**Example:**
```json
{
  "name": "list_wallets",
  "arguments": {}
}
```

### set_current_wallet

Sets the active wallet for transactions.

**Parameters:**
- `address` (required, string): Wallet address to set as current

**Returns:**
- Confirmation message

**Example:**
```json
{
  "name": "set_current_wallet",
  "arguments": {
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
  }
}
```

### get_current_wallet

Gets information about the currently active wallet.

**Parameters:** None

**Returns:**
- Wallet address
- Masked private key
- Public key (if available)

## Balance & Transactions

### get_balance

Gets the balance of a wallet address for native tokens or ERC20 tokens.

**Parameters:**
- `address` (required, string): Wallet address to check
- `tokenAddress` (optional, string): ERC20 token contract address

**Returns:**
- Balance amount
- Token symbol and name (for ERC20 tokens)

**Examples:**

Native balance:
```json
{
  "name": "get_balance",
  "arguments": {
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
  }
}
```

ERC20 token balance:
```json
{
  "name": "get_balance",
  "arguments": {
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    "tokenAddress": "0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c"
  }
}
```

### send_transaction

Sends native tokens or ERC20 tokens to another address.

**Parameters:**
- `to` (required, string): Recipient address
- `amount` (required, string): Amount to send (in token units, not wei)
- `tokenAddress` (optional, string): ERC20 token contract address
- `gasLimit` (optional, string): Gas limit for the transaction
- `gasPrice` (optional, string): Gas price in wei

**Returns:**
- Transaction hash
- Transaction details
- Status

**Examples:**

Send native tokens:
```json
{
  "name": "send_transaction",
  "arguments": {
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "0.1"
  }
}
```

Send ERC20 tokens:
```json
{
  "name": "send_transaction",
  "arguments": {
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "100",
    "tokenAddress": "0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c"
  }
}
```

### get_transaction

Gets detailed information about a transaction by its hash.

**Parameters:**
- `hash` (required, string): Transaction hash

**Returns:**
- Transaction details (from, to, value, gas used, etc.)
- Block information
- Status (confirmed, pending, failed)

**Example:**
```json
{
  "name": "get_transaction",
  "arguments": {
    "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  }
}
```

## Blockchain Queries

### get_block

Gets information about a specific block.

**Parameters:**
- `blockNumber` (optional, number): Block number
- `blockHash` (optional, string): Block hash

**Note:** Either `blockNumber` or `blockHash` can be provided. If neither is provided, returns the latest block.

**Returns:**
- Block details (number, hash, timestamp, etc.)
- Transaction count
- Gas information

**Examples:**

Latest block:
```json
{
  "name": "get_block",
  "arguments": {}
}
```

Specific block by number:
```json
{
  "name": "get_block",
  "arguments": {
    "blockNumber": 12345678
  }
}
```

### get_network_info

Gets current network information and status.

**Parameters:** None

**Returns:**
- Network name and chain ID
- Latest block number
- Current gas price
- Connection status

**Example:**
```json
{
  "name": "get_network_info",
  "arguments": {}
}
```

## Smart Contracts

### call_contract

Calls a smart contract method (read-only operation).

**Parameters:**
- `contractAddress` (required, string): Smart contract address
- `methodName` (required, string): Method name to call
- `parameters` (optional, array): Method parameters
- `abi` (optional, array): Contract ABI (if not provided, basic ABI is used)

**Returns:**
- Method call result

**Example:**
```json
{
  "name": "call_contract",
  "arguments": {
    "contractAddress": "0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c",
    "methodName": "balanceOf",
    "parameters": ["0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"]
  }
}
```

### send_contract_transaction

Sends a transaction to a smart contract method.

**Parameters:**
- `contractAddress` (required, string): Smart contract address
- `methodName` (required, string): Method name to call
- `parameters` (optional, array): Method parameters
- `abi` (optional, array): Contract ABI
- `value` (optional, string): Ether value to send with transaction
- `gasLimit` (optional, string): Gas limit
- `gasPrice` (optional, string): Gas price in wei

**Returns:**
- Transaction hash
- Transaction details
- Status

**Example:**
```json
{
  "name": "send_contract_transaction",
  "arguments": {
    "contractAddress": "0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c",
    "methodName": "transfer",
    "parameters": [
      "0x1234567890123456789012345678901234567890",
      "1000000000000000000"
    ]
  }
}
```

## Utilities

### estimate_gas

Estimates the gas cost for a transaction.

**Parameters:**
- `to` (required, string): Recipient address
- `value` (optional, string): Value to send in ether
- `data` (optional, string): Transaction data

**Returns:**
- Estimated gas limit
- Current gas price
- Estimated total cost in ether

**Example:**
```json
{
  "name": "estimate_gas",
  "arguments": {
    "to": "0x1234567890123456789012345678901234567890",
    "value": "0.1"
  }
}
```

## Error Handling

All tools return errors in a consistent format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: [Error message]"
    }
  ]
}
```

Common error scenarios:
- Invalid addresses
- Insufficient balance
- Network connectivity issues
- Invalid parameters
- Wallet not found

## Rate Limits

The server doesn't impose rate limits, but the underlying blockchain network may have limitations. Consider implementing appropriate delays between requests in high-frequency scenarios.
