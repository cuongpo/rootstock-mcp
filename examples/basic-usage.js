/**
 * Basic Usage Examples for Rootstock MCP Server
 *
 * This file demonstrates how to interact with the Rootstock MCP Server
 * using various MCP clients and tools.
 */

// Example 1: Create a new wallet
async function createWallet() {
  const result = await mcp.callTool('create_wallet', {
    name: 'MyFirstWallet'
  });
  
  console.log('Wallet created:', result);
  // Save the mnemonic phrase securely!
}

// Example 2: Import an existing wallet
async function importWallet() {
  const result = await mcp.callTool('import_wallet', {
    mnemonic: 'your twelve word mnemonic phrase goes here like this example phrase',
    name: 'ImportedWallet'
  });
  
  console.log('Wallet imported:', result);
}

// Example 3: Check wallet balance
async function checkBalance() {
  const result = await mcp.callTool('get_balance', {
    address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
  });
  
  console.log('Balance:', result);
}

// Example 4: Check ERC20 token balance
async function checkTokenBalance() {
  const result = await mcp.callTool('get_balance', {
    address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    tokenAddress: '0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c'
  });
  
  console.log('Token balance:', result);
}

// Example 5: Send native tokens
async function sendNativeTokens() {
  const result = await mcp.callTool('send_transaction', {
    to: '0x1234567890123456789012345678901234567890',
    amount: '0.1' // 0.1 ETH
  });
  
  console.log('Transaction sent:', result);
}

// Example 6: Send ERC20 tokens
async function sendTokens() {
  const result = await mcp.callTool('send_transaction', {
    to: '0x1234567890123456789012345678901234567890',
    amount: '100', // 100 tokens
    tokenAddress: '0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c'
  });
  
  console.log('Token transaction sent:', result);
}

// Example 7: Get transaction details
async function getTransaction() {
  const result = await mcp.callTool('get_transaction', {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  });
  
  console.log('Transaction details:', result);
}

// Example 8: Get network information
async function getNetworkInfo() {
  const result = await mcp.callTool('get_network_info', {});
  
  console.log('Network info:', result);
}

// Example 9: Estimate gas for a transaction
async function estimateGas() {
  const result = await mcp.callTool('estimate_gas', {
    to: '0x1234567890123456789012345678901234567890',
    value: '0.1'
  });
  
  console.log('Gas estimate:', result);
}

// Example 10: Call a smart contract (read-only)
async function callContract() {
  const result = await mcp.callTool('call_contract', {
    contractAddress: '0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c',
    methodName: 'balanceOf',
    parameters: ['0x742d35Cc6634C0532925a3b8D4C9db96590c6C87']
  });
  
  console.log('Contract call result:', result);
}

// Example 11: Send a transaction to a smart contract
async function sendContractTransaction() {
  const result = await mcp.callTool('send_contract_transaction', {
    contractAddress: '0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c',
    methodName: 'transfer',
    parameters: [
      '0x1234567890123456789012345678901234567890', // to address
      '1000000000000000000' // amount in wei (1 token with 18 decimals)
    ]
  });
  
  console.log('Contract transaction sent:', result);
}

// Example 12: List all wallets
async function listWallets() {
  const result = await mcp.callTool('list_wallets', {});
  
  console.log('Available wallets:', result);
}

// Example 13: Set current wallet
async function setCurrentWallet() {
  const result = await mcp.callTool('set_current_wallet', {
    address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
  });
  
  console.log('Current wallet set:', result);
}

// Example 14: Get current wallet info
async function getCurrentWallet() {
  const result = await mcp.callTool('get_current_wallet', {});
  
  console.log('Current wallet:', result);
}

// Example usage in a complete workflow
async function completeWorkflow() {
  try {
    // 1. Create or import a wallet
    console.log('Step 1: Creating wallet...');
    await createWallet();
    
    // 2. List available wallets
    console.log('Step 2: Listing wallets...');
    await listWallets();
    
    // 3. Check balance
    console.log('Step 3: Checking balance...');
    await checkBalance();
    
    // 4. Get network info
    console.log('Step 4: Getting network info...');
    await getNetworkInfo();
    
    // 5. Estimate gas for a transaction
    console.log('Step 5: Estimating gas...');
    await estimateGas();
    
    // 6. Send a test transaction (uncomment when ready)
    // console.log('Step 6: Sending transaction...');
    // await sendNativeTokens();
    
    console.log('Workflow completed successfully!');
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createWallet,
    importWallet,
    checkBalance,
    checkTokenBalance,
    sendNativeTokens,
    sendTokens,
    getTransaction,
    getNetworkInfo,
    estimateGas,
    callContract,
    sendContractTransaction,
    listWallets,
    setCurrentWallet,
    getCurrentWallet,
    completeWorkflow
  };
}
