#!/usr/bin/env node

/**
 * ERC20 Token Deployment Example for Rootstock MCP Server
 *
 * This example demonstrates how to:
 * 1. Deploy a new ERC20 token
 * 2. Get token information
 * 3. Mint additional tokens (if mintable)
 */

import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

class ERC20DeploymentExample {
  constructor() {
    this.serverProcess = null;
    this.requestId = 1;
  }

  async startMCPServer() {
    console.log('🚀 Starting Rootstock MCP Server...');

    this.serverProcess = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ROOTSTOCK_RPC_URL: 'https://public-node.testnet.rsk.co',
        ROOTSTOCK_CHAIN_ID: '31',
        ROOTSTOCK_NETWORK_NAME: 'Rootstock Testnet',
        ROOTSTOCK_CURRENCY_SYMBOL: 'tRBTC',
        ROOTSTOCK_EXPLORER_URL: 'https://explorer.testnet.rootstock.io',
        ROOTSTOCK_PRIVATE_KEYS: 'your_private_key_here',
        ROOTSTOCK_CURRENT_ADDRESS: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
      }
    });

    // Wait for server initialization
    await sleep(3000);
    console.log('✅ MCP Server is ready\n');
  }

  async stopMCPServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('🛑 MCP Server stopped');
    }
  }

  async sendMCPRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params
      };

      let responseData = '';
      let errorData = '';

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 120000); // Increase timeout to 2 minutes for blockchain transactions

      this.serverProcess.stdout.on('data', (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData.trim());
          clearTimeout(timeout);
          resolve(response);
        } catch (e) {
          // Continue collecting data
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async runExample() {
    try {
      await this.startMCPServer();

      console.log('🔧 ERC20 Token Deployment Example');
      console.log('=' .repeat(50));

      // Step 1: Import the funded wallet
      console.log('\n📝 Step 1: Importing funded wallet for deployment...');
      const walletResponse = await this.sendMCPRequest('tools/call', {
        name: 'import_wallet',
        arguments: {
          name: 'Funded ERC20 Deployer',
          privateKey: 'your_private_key_here'
        }
      });

      if (walletResponse.error) {
        throw new Error(`Failed to import wallet: ${walletResponse.error.message}`);
      }

      console.log('✅ Funded wallet imported successfully');
      const walletAddress = walletResponse.result.content[0].text.match(/Address: (0x[a-fA-F0-9]{40})/)?.[1];
      console.log(`   Address: ${walletAddress}`);

      // Step 2: Deploy a standard ERC20 token
      console.log('\n🚀 Step 2: Deploying a standard ERC20 token...');
      const deployResponse = await this.sendMCPRequest('tools/call', {
        name: 'deploy_erc20_token',
        arguments: {
          name: 'Example Token',
          symbol: 'EXMPL',
          decimals: 18,
          initialSupply: '1000000',
          mintable: false
        }
      });

      if (deployResponse.error) {
        throw new Error(`Failed to deploy token: ${deployResponse.error.message}`);
      }

      console.log('✅ Standard ERC20 token deployed successfully!');
      const contractAddress = deployResponse.result.content[0].text.match(/Contract Address: (0x[a-fA-F0-9]{40})/)?.[1];
      console.log(`   Contract Address: ${contractAddress}`);

      // Step 3: Get token information
      console.log('\n📊 Step 3: Getting token information...');
      const tokenInfoResponse = await this.sendMCPRequest('tools/call', {
        name: 'get_token_info',
        arguments: {
          tokenAddress: contractAddress
        }
      });

      if (tokenInfoResponse.error) {
        throw new Error(`Failed to get token info: ${tokenInfoResponse.error.message}`);
      }

      console.log('✅ Token information retrieved:');
      console.log(tokenInfoResponse.result.content[0].text);

      // Step 4: Deploy a mintable ERC20 token
      console.log('\n🔄 Step 4: Deploying a mintable ERC20 token...');
      const mintableDeployResponse = await this.sendMCPRequest('tools/call', {
        name: 'deploy_erc20_token',
        arguments: {
          name: 'Mintable Token',
          symbol: 'MINT',
          decimals: 18,
          initialSupply: '500000',
          mintable: true
        }
      });

      if (mintableDeployResponse.error) {
        throw new Error(`Failed to deploy mintable token: ${mintableDeployResponse.error.message}`);
      }

      console.log('✅ Mintable ERC20 token deployed successfully!');
      const mintableContractAddress = mintableDeployResponse.result.content[0].text.match(/Contract Address: (0x[a-fA-F0-9]{40})/)?.[1];
      console.log(`   Contract Address: ${mintableContractAddress}`);

      // Step 5: Mint additional tokens
      console.log('\n💰 Step 5: Minting additional tokens...');
      
      const mintResponse = await this.sendMCPRequest('tools/call', {
        name: 'mint_tokens',
        arguments: {
          tokenAddress: mintableContractAddress,
          to: walletAddress,
          amount: '100000'
        }
      });

      if (mintResponse.error) {
        console.log('⚠️  Minting failed (this is expected on testnet without funds):');
        console.log(`   ${mintResponse.error.message}`);
      } else {
        console.log('✅ Tokens minted successfully!');
        console.log(mintResponse.result.content[0].text);
      }

      console.log('\n🎉 ERC20 Deployment Example completed!');
      console.log('\n📋 Summary of available ERC20 tools:');
      console.log('   • deploy_erc20_token - Deploy new ERC20 tokens');
      console.log('   • get_token_info - Get token contract information');
      console.log('   • mint_tokens - Mint tokens (for mintable contracts)');
      console.log('   • send_transaction - Transfer tokens (with tokenAddress parameter)');

    } catch (error) {
      console.error('❌ Example failed:', error.message);
    } finally {
      await this.stopMCPServer();
    }
  }
}

// Run the example
async function main() {
  const example = new ERC20DeploymentExample();
  await example.runExample();
}

main().catch(console.error);
