# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Rootstock MCP Server.

## Common Issues

### 1. Server Won't Start

#### Symptoms
- Server exits immediately
- "Module not found" errors
- Port binding errors

#### Solutions

**Check Node.js Version:**
```bash
node --version  # Should be 18.0.0 or higher
```

**Install Dependencies:**
```bash
npm install
npm run build
```

**Check Environment Variables:**
```bash
# Verify required variables are set
echo $ROOTSTOCK_RPC_URL
```

**Check File Permissions:**
```bash
chmod +x build/index.js
```

### 2. Connection Issues

#### Symptoms
- "Network not connected" errors
- Timeout errors
- "Failed to fetch" errors

#### Solutions

**Test RPC Connection:**
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $ROOTSTOCK_RPC_URL
```

**Check Firewall Settings:**
- Ensure outbound connections are allowed
- Check corporate firewall rules
- Verify proxy settings

**Update RPC URL:**
```env
# Try alternative endpoints
ROOTSTOCK_RPC_URL=https://backup-rpc.hyperion.io
```

### 3. Wallet Issues

#### Symptoms
- "Wallet not found" errors
- "Invalid private key" errors
- "Insufficient funds" errors

#### Solutions

**Validate Private Key Format:**
```javascript
// Private key should be 64 hex characters with 0x prefix
const isValid = /^0x[a-fA-F0-9]{64}$/.test(privateKey);
```

**Check Wallet Balance:**
```json
{
  "name": "get_balance",
  "arguments": {
    "address": "your_wallet_address"
  }
}
```

**Verify Address Derivation:**
```javascript
const ethers = require('ethers');
const wallet = new ethers.Wallet('your_private_key');
console.log('Address:', wallet.address);
```

### 4. Transaction Failures

#### Symptoms
- "Transaction reverted" errors
- "Out of gas" errors
- "Nonce too low/high" errors

#### Solutions

**Check Gas Settings:**
```json
{
  "name": "estimate_gas",
  "arguments": {
    "to": "recipient_address",
    "value": "0.1"
  }
}
```

**Verify Recipient Address:**
```javascript
const ethers = require('ethers');
const isValid = ethers.isAddress('recipient_address');
```

**Check Network Status:**
```json
{
  "name": "get_network_info",
  "arguments": {}
}
```

### 5. Smart Contract Issues

#### Symptoms
- "Contract not found" errors
- "Method not found" errors
- "Invalid ABI" errors

#### Solutions

**Verify Contract Address:**
- Check on block explorer
- Ensure contract is deployed
- Verify network (mainnet vs testnet)

**Check Method Signature:**
```javascript
// Ensure method name and parameters match contract ABI
const methodSignature = 'transfer(address,uint256)';
```

**Provide Complete ABI:**
```json
{
  "name": "call_contract",
  "arguments": {
    "contractAddress": "0x...",
    "methodName": "balanceOf",
    "parameters": ["0x..."],
    "abi": [
      {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
      }
    ]
  }
}
```

## Debugging Steps

### 1. Enable Debug Mode

```env
DEBUG=true
NODE_ENV=development
```

### 2. Check Server Logs

```bash
# Run server with verbose output
npm run dev

# Or check logs if running as service
tail -f /var/log/hyperion-mcp.log
```

### 3. Test Individual Components

**Test RPC Connection:**
```bash
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('$ROOTSTOCK_RPC_URL');
provider.getBlockNumber().then(console.log).catch(console.error);
"
```

**Test Wallet Loading:**
```bash
node -e "
const { ethers } = require('ethers');
const wallet = new ethers.Wallet('$ROOTSTOCK_PRIVATE_KEYS');
console.log('Address:', wallet.address);
"
```

### 4. Use MCP Inspector

Install and use the MCP Inspector for interactive debugging:

```bash
npx @modelcontextprotocol/inspector build/index.js
```

## Error Messages

### Common Error Messages and Solutions

#### "Error: could not detect network"
- **Cause:** Invalid RPC URL or network unreachable
- **Solution:** Check RPC URL and network connectivity

#### "Error: insufficient funds for gas"
- **Cause:** Wallet doesn't have enough native tokens for gas
- **Solution:** Add funds to wallet or reduce gas price

#### "Error: nonce has already been used"
- **Cause:** Transaction nonce conflict
- **Solution:** Wait for pending transactions or restart server

#### "Error: execution reverted"
- **Cause:** Smart contract execution failed
- **Solution:** Check contract parameters and state

#### "Error: invalid address"
- **Cause:** Malformed Ethereum address
- **Solution:** Verify address format (0x + 40 hex characters)

## Performance Issues

### Slow Response Times

**Check Network Latency:**
```bash
ping rpc-server-hostname
```

**Increase Timeout:**
```env
ROOTSTOCK_API_TIMEOUT=60000
```

**Use Local Node:**
```env
ROOTSTOCK_RPC_URL=http://localhost:8545
```

### High Memory Usage

**Monitor Memory:**
```bash
node --max-old-space-size=4096 build/index.js
```

**Check for Memory Leaks:**
```bash
node --inspect build/index.js
```

## Security Issues

### Private Key Exposure

**Symptoms:**
- Private keys in logs
- Keys in error messages
- Unauthorized transactions

**Solutions:**
- Review log files and remove sensitive data
- Rotate compromised keys immediately
- Implement proper key masking

### Unauthorized Access

**Symptoms:**
- Unexpected transactions
- Balance changes
- Unknown wallet activity

**Solutions:**
- Change private keys immediately
- Review transaction history
- Implement access controls

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Review server logs**
3. **Test with minimal configuration**
4. **Gather relevant information:**
   - Node.js version
   - Operating system
   - Error messages
   - Configuration (without private keys)

### Where to Get Help

1. **GitHub Issues:** Report bugs and feature requests
2. **Documentation:** Check API reference and configuration guide
3. **Community:** Join discussions and forums
4. **Support:** Contact support team for critical issues

### Information to Include

When reporting issues, include:

```
**Environment:**
- Node.js version: 
- Operating system: 
- Server version: 

**Configuration:**
- RPC URL: (without credentials)
- Network: 
- Chain ID: 

**Error Message:**
```
[Paste full error message here]
```

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]
```

## Preventive Measures

### Regular Maintenance

1. **Update Dependencies:**
```bash
npm audit
npm update
```

2. **Monitor Logs:**
```bash
# Set up log rotation
logrotate /etc/logrotate.d/hyperion-mcp
```

3. **Backup Configuration:**
```bash
# Backup environment files (without private keys)
cp .env .env.backup
```

### Health Monitoring

1. **Set up Health Checks:**
```bash
# Create health check script
#!/bin/bash
curl -f http://localhost:3000/health || exit 1
```

2. **Monitor Key Metrics:**
- Response times
- Error rates
- Memory usage
- Disk space

3. **Set up Alerts:**
- High error rates
- Service downtime
- Low wallet balances

### Security Audits

1. **Regular Key Rotation**
2. **Access Log Reviews**
3. **Dependency Vulnerability Scans**
4. **Configuration Reviews**
