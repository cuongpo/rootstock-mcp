#!/usr/bin/env node

/**
 * Debug script to check if ERC20 tools are properly registered
 */

import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

class ToolsDebugger {
  constructor() {
    this.serverProcess = null;
    this.requestId = 1;
  }

  async startMCPServer() {
    console.log('🚀 Starting Rootstock MCP Server for debugging...');
    
    this.serverProcess = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ROOTSTOCK_RPC_URL: 'https://public-node.testnet.rsk.co',
        ROOTSTOCK_CHAIN_ID: '31',
        ROOTSTOCK_NETWORK_NAME: 'Rootstock Testnet',
        ROOTSTOCK_CURRENCY_SYMBOL: 'tRBTC',
        ROOTSTOCK_EXPLORER_URL: 'https://explorer.testnet.rootstock.io'
      }
    });

    // Wait for server initialization
    await sleep(3000);
    console.log('✅ MCP Server started\n');
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
      }, 10000);

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
        console.log('Server error:', data.toString());
      });

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async debugTools() {
    try {
      await this.startMCPServer();

      console.log('🔍 Debugging ERC20 Tools Registration');
      console.log('=' .repeat(50));

      // Step 1: List all tools
      console.log('\n📝 Step 1: Listing all available tools...');
      const toolsResponse = await this.sendMCPRequest('tools/list');

      if (toolsResponse.error) {
        console.error('❌ Failed to list tools:', toolsResponse.error);
        return;
      }

      console.log('✅ Tools response received');
      const tools = toolsResponse.result.tools;
      
      console.log(`\n📊 Total tools found: ${tools.length}`);
      
      // Check for ERC20 tools specifically
      const erc20Tools = ['deploy_erc20_token', 'get_token_info', 'mint_tokens'];
      const foundERC20Tools = [];
      const missingERC20Tools = [];

      erc20Tools.forEach(toolName => {
        const found = tools.find(tool => tool.name === toolName);
        if (found) {
          foundERC20Tools.push(found);
        } else {
          missingERC20Tools.push(toolName);
        }
      });

      console.log('\n🔧 ERC20 Tools Status:');
      console.log(`✅ Found: ${foundERC20Tools.length}/${erc20Tools.length}`);
      console.log(`❌ Missing: ${missingERC20Tools.length}/${erc20Tools.length}`);

      if (foundERC20Tools.length > 0) {
        console.log('\n✅ Found ERC20 Tools:');
        foundERC20Tools.forEach(tool => {
          console.log(`   • ${tool.name}: ${tool.description}`);
        });
      }

      if (missingERC20Tools.length > 0) {
        console.log('\n❌ Missing ERC20 Tools:');
        missingERC20Tools.forEach(toolName => {
          console.log(`   • ${toolName}`);
        });
      }

      console.log('\n📋 All Available Tools:');
      tools.forEach((tool, index) => {
        const isERC20 = erc20Tools.includes(tool.name);
        const prefix = isERC20 ? '🪙' : '🔧';
        console.log(`   ${prefix} ${tool.name}: ${tool.description}`);
      });

      if (foundERC20Tools.length === erc20Tools.length) {
        console.log('\n🎉 SUCCESS: All ERC20 tools are properly registered!');
        console.log('\nIf you\'re not seeing them in your client, the issue might be:');
        console.log('1. Client cache - try refreshing or restarting your client');
        console.log('2. MCP client configuration - check your client settings');
        console.log('3. Server restart needed - restart the MCP server');
      } else {
        console.log('\n❌ ISSUE: Some ERC20 tools are missing from registration');
        console.log('This indicates a problem with the tool registration in the server code.');
      }

    } catch (error) {
      console.error('❌ Debug failed:', error.message);
    } finally {
      await this.stopMCPServer();
    }
  }
}

// Run the debug
async function main() {
  const toolsDebugger = new ToolsDebugger();
  await toolsDebugger.debugTools();
}

main().catch(console.error);
