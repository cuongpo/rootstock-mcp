#!/usr/bin/env node

/**
 * Simple test to demonstrate MCP server functionality
 */

import { RootstockClient } from './build/rootstock-client.js';
import { WalletManager } from './build/wallet-manager.js';

async function testBalanceDirectly() {
  console.log('🧪 Testing Rootstock Client Balance Functionality');
  console.log('================================================\n');

  try {
    // Initialize the Rootstock client with a public RPC endpoint
    const config = {
      rpcUrl: 'https://eth.llamarpc.com', // Public Ethereum RPC
      chainId: 1,
      networkName: 'Ethereum Mainnet'
    };

    console.log('🔗 Connecting to Ethereum network...');
    const client = new RootstockClient(config);

    // Test with Vitalik's well-known address
    const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    
    console.log(`📍 Testing balance for address: ${testAddress}`);
    console.log('⏳ Fetching balance...\n');

    // Test native balance
    const balance = await client.getBalance(testAddress);
    console.log('✅ Native Balance Retrieved:');
    console.log(`   Address: ${testAddress}`);
    console.log(`   Balance: ${balance} ETH\n`);

    // Test network info
    console.log('🌐 Getting network information...');
    const networkInfo = await client.getNetworkInfo();
    console.log('✅ Network Info Retrieved:');
    console.log(`   Network: ${networkInfo.networkName}`);
    console.log(`   Chain ID: ${networkInfo.chainId}`);
    console.log(`   Latest Block: ${networkInfo.blockNumber}`);
    console.log(`   Connected: ${networkInfo.isConnected}\n`);

    // Test gas estimation
    console.log('⛽ Testing gas estimation...');
    const gasEstimate = await client.estimateGas(
      '0x1234567890123456789012345678901234567890',
      '0.1'
    );
    console.log('✅ Gas Estimate Retrieved:');
    console.log(`   Gas Limit: ${gasEstimate.gasLimit}`);
    console.log(`   Gas Price: ${gasEstimate.gasPrice} wei`);
    console.log(`   Estimated Cost: ${gasEstimate.estimatedCost} ETH\n`);

    console.log('🎉 All tests completed successfully!');
    return true;

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('💡 This might be due to network connectivity or RPC limits');
    return false;
  }
}

async function testWalletManager() {
  console.log('🔐 Testing Wallet Manager Functionality');
  console.log('======================================\n');

  try {
    const walletManager = new WalletManager();

    // Test wallet creation
    console.log('👛 Creating a new test wallet...');
    const newWallet = walletManager.createWallet('TestWallet');
    console.log('✅ Wallet Created:');
    console.log(`   Address: ${newWallet.address}`);
    console.log(`   Mnemonic: ${newWallet.mnemonic?.substring(0, 20)}...`);
    console.log(`   Has Private Key: ${!!newWallet.privateKey}\n`);

    // Test wallet listing
    console.log('📋 Listing all wallets...');
    const wallets = walletManager.listWallets();
    console.log('✅ Wallets Listed:');
    wallets.forEach((wallet, index) => {
      console.log(`   ${index + 1}. ${wallet.address}`);
    });
    console.log();

    // Test current wallet
    console.log('🎯 Getting current wallet...');
    const currentAddress = walletManager.getCurrentAddress();
    console.log('✅ Current Wallet:');
    console.log(`   Address: ${currentAddress}\n`);

    console.log('🎉 Wallet manager tests completed successfully!');
    return true;

  } catch (error) {
    console.log('❌ Wallet test failed:', error.message);
    return false;
  }
}

async function demonstrateMCPTools() {
  console.log('🛠️ MCP Tools Demonstration');
  console.log('===========================\n');

  const tools = [
    {
      name: 'create_wallet',
      description: 'Create a new wallet with mnemonic phrase',
      example: '{ name: "MyWallet" }'
    },
    {
      name: 'get_balance',
      description: 'Get wallet balance (native or ERC20)',
      example: '{ address: "0x...", tokenAddress: "0x..." }'
    },
    {
      name: 'send_transaction',
      description: 'Send tokens to another address',
      example: '{ to: "0x...", amount: "0.1" }'
    },
    {
      name: 'get_transaction',
      description: 'Get transaction details by hash',
      example: '{ hash: "0x..." }'
    },
    {
      name: 'get_network_info',
      description: 'Get current network information',
      example: '{}'
    },
    {
      name: 'estimate_gas',
      description: 'Estimate transaction gas costs',
      example: '{ to: "0x...", value: "0.1" }'
    },
    {
      name: 'call_contract',
      description: 'Call smart contract method (read-only)',
      example: '{ contractAddress: "0x...", methodName: "balanceOf" }'
    }
  ];

  console.log('📋 Available MCP Tools:\n');
  tools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name}`);
    console.log(`   📝 ${tool.description}`);
    console.log(`   💡 Example: ${tool.example}\n`);
  });

  console.log('🔗 Integration Examples:\n');
  
  console.log('📱 Claude Desktop Integration:');
  console.log(`{
  "mcpServers": {
    "rootstock-mcp": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "ROOTSTOCK_RPC_URL": "https://your-rpc-url",
        "ROOTSTOCK_PRIVATE_KEYS": "your_private_key"
      }
    }
  }
}\n`);

  console.log('🐳 Docker Usage:');
  console.log('docker run -e ROOTSTOCK_RPC_URL=your_url rootstock-mcp\n');

  console.log('🌐 Web Dashboard:');
  console.log('cd dashboard && npm run dev\n');
}

async function main() {
  console.log('🚀 Rootstock MCP Server - Comprehensive Test Suite');
  console.log('==================================================\n');

  const args = process.argv.slice(2);

  if (args.includes('--demo') || args.includes('-d')) {
    await demonstrateMCPTools();
  } else if (args.includes('--wallet') || args.includes('-w')) {
    await testWalletManager();
  } else if (args.includes('--balance') || args.includes('-b')) {
    await testBalanceDirectly();
  } else {
    // Run all tests
    console.log('🎯 Running all tests...\n');
    
    const walletTest = await testWalletManager();
    console.log('─'.repeat(50) + '\n');
    
    const balanceTest = await testBalanceDirectly();
    console.log('─'.repeat(50) + '\n');
    
    await demonstrateMCPTools();
    
    console.log('📊 Test Summary:');
    console.log(`   Wallet Manager: ${walletTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Balance Check: ${balanceTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Tools Demo: ✅ COMPLETED\n`);
  }

  console.log('🏁 Test suite completed!');
  console.log('\n💡 Usage options:');
  console.log('   node simple-test.js --balance   # Test balance functionality');
  console.log('   node simple-test.js --wallet    # Test wallet management');
  console.log('   node simple-test.js --demo      # Show MCP tools demo');
  console.log('   node simple-test.js             # Run all tests');
}

main().catch(console.error);
