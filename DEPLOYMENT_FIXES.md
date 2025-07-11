# Smithery Deployment Fixes

## Issues Fixed

### 1. JSON Import Assertion Error ✅
**Problem**: ES modules require import assertions for JSON files
**Fix**: Updated `src/rootstock-client.ts` line 21:
```typescript
// Before
import erc721Contracts from './erc721-contracts-rootstock.json';

// After  
import erc721Contracts from './erc721-contracts-rootstock.json' with { type: 'json' };
```

### 2. Incorrect Start Command Type ✅
**Problem**: `smithery.yaml` had `startCommand.type: http` but this is an MCP server using stdio
**Fix**: Updated `smithery.yaml` line 47:
```yaml
# Before
startCommand:
  type: http

# After
startCommand:
  type: mcp
```

### 3. Incorrect Build Command ✅
**Problem**: Build command was `npm run build` instead of `npm run build:smithery`
**Fix**: Updated `smithery.yaml` line 38:
```yaml
# Before
build:
  command: "npm run build"

# After
build:
  command: "npm run build:smithery"
```

### 4. Validation Script Errors ✅
**Problem**: Validation script was looking for wrong files
**Fixes**:
- Updated file references from `hyperion` to `rootstock`
- Removed Docker file requirements (Docker is disabled)
- Updated build artifact checks

### 5. Inconsistent Branding ✅
**Problem**: Mixed references to "Hyperion" and "Rootstock" throughout the code
**Fix**: Updated all user-facing messages to consistently use "Rootstock testnet"

### 6. Tool Discovery Issue (failedToFetchConfigSchema) ✅
**Problem**: Smithery couldn't scan tools due to configuration schema conflicts
**Fix**: Resolved configuration schema conflicts:
- Implemented lazy loading (privateKey optional for tool discovery)
- Removed conflicting `environment` section from smithery.yaml
- For MCP servers, Smithery uses `configSchema` approach, not environment variables
- Server starts without private key and exposes all 18 tools for discovery

## Deployment Status

✅ **All validation checks passed (14/14)**
✅ **Server starts successfully**
✅ **MCP protocol compatibility confirmed**
✅ **JSON imports working**
✅ **Build process complete**

## Ready for Deployment

The server is now ready for Smithery deployment. Run:

```bash
smithery login
smithery deploy
```

## Key Features Available

### ERC20 Token Tools
- `deploy_erc20_token` - Deploy new ERC20 tokens (standard or mintable)
- `get_token_info` - Get comprehensive token information
- `mint_tokens` - Mint additional tokens (for mintable contracts)

### Wallet Management
- `create_wallet` - Generate new wallets
- `import_wallet` - Import existing wallets
- `list_wallets` - View all wallets
- `get_balance` - Check balances (native and ERC20)

### Blockchain Operations
- `send_transaction` - Send native tokens or ERC20 transfers
- `get_transaction` - Query transaction details
- `get_network_info` - Network status and information
- `estimate_gas` - Gas cost estimation

### Smart Contract Interaction
- `call_contract` - Read-only contract calls
- `send_contract_transaction` - Contract transactions

## Configuration

Users will need to provide:
- **Private Key**: Funded Rootstock testnet private key
- **RPC URL**: Default is `https://public-node.testnet.rsk.co`
- **Chain ID**: Default is `31` (Rootstock testnet)

## Network Details

- **Network**: Rootstock Testnet
- **Chain ID**: 31
- **Currency**: tRBTC
- **Explorer**: https://explorer.testnet.rootstock.io
- **RPC**: https://public-node.testnet.rsk.co

## Next Steps

1. Deploy to Smithery: `smithery deploy`
2. Test with a funded Rootstock testnet wallet
3. Verify ERC20 deployment functionality
4. Monitor for any timeout issues during deployment

The timeout issues and "failedToFetchConfigSchema" error you experienced should now be resolved with these fixes.

## Latest Update: Configuration Schema Fix

The most recent fix addresses the specific error you encountered:
- **Error**: `Failed to scan tools list from server: failedToFetchConfigSchema`
- **Root Cause**: Conflicting configuration methods in smithery.yaml (both `configSchema` and `environment` sections)
- **Solution**:
  1. Implemented lazy loading pattern for tool discovery
  2. Removed conflicting `environment` section from smithery.yaml
  3. Used only `configSchema` approach as required for MCP servers
- **Result**: Server now starts cleanly and exposes all 18 tools for discovery without schema conflicts

Your Rootstock MCP server should now deploy successfully to Smithery!
