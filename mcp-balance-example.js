#!/usr/bin/env node

/**
 * Practical example of using the get_balance MCP tool
 * This demonstrates how to interact with the Rootstock MCP Server
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

class MCPBalanceExample {
  constructor() {
    this.serverProcess = null;
  }

  async startMCPServer() {
    console.log('🚀 Starting Rootstock MCP Server...');
    
    this.serverProcess = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ROOTSTOCK_RPC_URL: 'https://eth.llamarpc.com',
        ROOTSTOCK_NETWORK_NAME: 'Ethereum Mainnet',
        ROOTSTOCK_CHAIN_ID: '1',
        DEBUG: 'false'
      }
    });

    // Wait for server initialization
    await setTimeout(3000);
    console.log('✅ MCP Server is ready\n');
  }

  async stopMCPServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('🛑 MCP Server stopped');
    }
  }

  async callMCPTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      console.log(`📞 Calling MCP tool: ${toolName}`);
      console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));

      const requestStr = JSON.stringify(request) + '\n';
      let responseBuffer = '';
      
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${toolName} response`));
      }, 15000);

      const onData = (data) => {
        responseBuffer += data.toString();
        
        // Try to parse JSON responses
        const lines = responseBuffer.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              this.serverProcess.stdout.off('data', onData);
              resolve(response);
              return;
            }
          } catch (e) {
            // Continue collecting data
          }
        }
      };

      this.serverProcess.stdout.on('data', onData);
      this.serverProcess.stdin.write(requestStr);
    });
  }

  async demonstrateGetBalance() {
    console.log('💰 Demonstrating get_balance MCP Tool');
    console.log('====================================\n');

    try {
      // Example 1: Get native ETH balance
      console.log('📊 Example 1: Get Native ETH Balance');
      console.log('─'.repeat(40));
      
      const ethBalance = await this.callMCPTool('get_balance', {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      });

      if (ethBalance.result && ethBalance.result.content) {
        console.log('✅ Success!');
        console.log('📋 Response:');
        console.log(ethBalance.result.content[0].text);
      } else {
        console.log('❌ Failed:', ethBalance.error?.message || 'Unknown error');
      }

      console.log('\n' + '─'.repeat(50) + '\n');

      // Example 2: Get ERC20 token balance (USDC)
      console.log('📊 Example 2: Get ERC20 Token Balance');
      console.log('─'.repeat(40));
      
      const tokenBalance = await this.callMCPTool('get_balance', {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        tokenAddress: '0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c' // Example token
      });

      if (tokenBalance.result && tokenBalance.result.content) {
        console.log('✅ Success!');
        console.log('📋 Response:');
        console.log(tokenBalance.result.content[0].text);
      } else {
        console.log('⚠️ Expected error (token contract may not exist):');
        console.log(tokenBalance.error?.message || 'Unknown error');
      }

    } catch (error) {
      console.log('❌ Demonstration failed:', error.message);
    }
  }

  async demonstrateOtherTools() {
    console.log('\n🛠️ Demonstrating Other MCP Tools');
    console.log('=================================\n');

    try {
      // Get network info
      console.log('🌐 Getting Network Information...');
      const networkInfo = await this.callMCPTool('get_network_info');
      
      if (networkInfo.result && networkInfo.result.content) {
        console.log('✅ Network Info Retrieved:');
        console.log(networkInfo.result.content[0].text);
      }

      console.log('\n' + '─'.repeat(30) + '\n');

      // Estimate gas
      console.log('⛽ Estimating Gas Costs...');
      const gasEstimate = await this.callMCPTool('estimate_gas', {
        to: '0x1234567890123456789012345678901234567890',
        value: '0.1'
      });
      
      if (gasEstimate.result && gasEstimate.result.content) {
        console.log('✅ Gas Estimate Retrieved:');
        console.log(gasEstimate.result.content[0].text);
      }

    } catch (error) {
      console.log('❌ Tool demonstration failed:', error.message);
    }
  }

  async runFullDemo() {
    console.log('🎯 Rootstock MCP Server - Live Balance Demo');
    console.log('==========================================\n');

    try {
      await this.startMCPServer();
      await this.demonstrateGetBalance();
      await this.demonstrateOtherTools();
      
      console.log('\n🎉 Live demo completed successfully!');
      
    } catch (error) {
      console.log('💥 Demo failed:', error.message);
    } finally {
      await this.stopMCPServer();
    }
  }
}

// Usage examples for different scenarios
function showUsageExamples() {
  console.log('📚 MCP get_balance Tool Usage Examples');
  console.log('======================================\n');

  console.log('1️⃣ Check Native Token Balance:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_balance",
    "arguments": {
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    }
  }
}\n`);

  console.log('2️⃣ Check ERC20 Token Balance:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_balance",
    "arguments": {
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "tokenAddress": "0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c"
    }
  }
}\n`);

  console.log('3️⃣ Expected Response Format:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Native Balance:\\n\\nAddress: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\\nBalance: 1.234 ETH"
      }
    ]
  }
}\n`);

  console.log('4️⃣ Integration with Claude Desktop:');
  console.log('Add this to your claude_desktop_config.json:');
  console.log(`{
  "mcpServers": {
    "hyperion-mcp": {
      "command": "node",
      "args": ["/path/to/hyperion-mcp-server/build/index.js"],
      "env": {
        "ROOTSTOCK_RPC_URL": "https://eth.llamarpc.com",
        "ROOTSTOCK_NETWORK_NAME": "Ethereum Mainnet"
      }
    }
  }
}\n`);

  console.log('5️⃣ Then in Claude, you can ask:');
  console.log('"What is the ETH balance of 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?"');
  console.log('And Claude will use the get_balance tool automatically!\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--examples') || args.includes('-e')) {
    showUsageExamples();
  } else if (args.includes('--live') || args.includes('-l')) {
    const demo = new MCPBalanceExample();
    await demo.runFullDemo();
  } else {
    console.log('🎯 Rootstock MCP Server - Balance Tool Demo');
    console.log('==========================================\n');
    
    console.log('Choose a demo option:\n');
    console.log('📖 --examples (-e)  Show usage examples and integration guide');
    console.log('🔴 --live (-l)      Run live demo with actual MCP server\n');
    
    console.log('Examples:');
    console.log('  node mcp-balance-example.js --examples');
    console.log('  node mcp-balance-example.js --live\n');
    
    // Show examples by default
    showUsageExamples();
  }
}

main().catch(console.error);
