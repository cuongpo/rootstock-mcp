import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from 'dotenv';

import { RootstockClient } from './rootstock-client.js';
import { WalletManager } from './wallet-manager.js';
import {
  RootstockConfig,
} from './types.js';

// Load environment variables
dotenv.config();

// Configuration schema for Smithery
export const configSchema = z.object({
  privateKey: z.string().optional().describe("Your funded private key for Rootstock testnet"),
  rpcUrl: z.string().default('https://public-node.testnet.rsk.co').describe("Rootstock RPC URL"),
  chainId: z.number().default(31).describe("Rootstock Chain ID"),
  networkName: z.string().default('Rootstock Testnet').describe("Network name"),
  explorerUrl: z.string().default('https://explorer.testnet.rootstock.io').describe("Block explorer URL"),
  currencySymbol: z.string().default('tRBTC').describe("Currency symbol"),
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

function createStatelessServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const server = new McpServer({
    name: "Rootstock Blockchain MCP Server",
    version: "1.1.0",
  });

  // Initialize configuration (following hyperion-mcp-server pattern)
  const rootstockConfig: RootstockConfig = {
    rpcUrl: config.rpcUrl,
    chainId: config.chainId,
    networkName: config.networkName,
    explorerUrl: config.explorerUrl,
    currencySymbol: config.currencySymbol,
  };

  // Initialize clients (following hyperion-mcp-server pattern)
  const rootstockClient = new RootstockClient(rootstockConfig);
  const walletManager = new WalletManager();

  // Import wallet from config if privateKey is provided
  if (config.privateKey) {
    try {
      walletManager.importWallet(config.privateKey, undefined, 'Smithery Wallet');
    } catch (error) {
      console.error('Failed to import wallet from config:', error);
    }
  }

  // Helper function to check if wallet is configured and return helpful error message
  const getWalletWithErrorHandling = () => {
    try {
      return walletManager.getCurrentWallet();
    } catch (error) {
      throw new Error(
        `❌ No wallet configured for this operation!\n\n` +
        `To use wallet operations, you need to configure your private key:\n\n` +
        `🔧 **Via Smithery Interface (Recommended):**\n` +
        `1. Click "Save & Connect" below\n` +
        `2. Enter your funded private key for Rootstock testnet\n` +
        `3. Example: 0x1234567890123456789012345678901234567890123456789012345678901234\n\n` +
        `🔧 **Alternative Methods:**\n` +
        `• Use 'import_wallet' tool to add your private key\n` +
        `• Set ROOTSTOCK_PRIVATE_KEY environment variable\n\n` +
        `Original error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Create Wallet Tool
  server.tool(
    "create_wallet",
    "Create a new Rootstock wallet with a generated mnemonic phrase",
    {
      name: z.string().optional().describe("Optional name for the wallet"),
    },
    async ({ name }) => {
      try {
        const walletInfo = walletManager.createWallet(name);
        return {
          content: [
            {
              type: "text",
              text: `Wallet created successfully!\n\nAddress: ${walletInfo.address}\nMnemonic: ${walletInfo.mnemonic}\n\n⚠️ IMPORTANT: Save your mnemonic phrase securely. It's the only way to recover your wallet!`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating wallet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Import Wallet Tool
  server.tool(
    "import_wallet",
    "Import an existing wallet using private key or mnemonic phrase",
    {
      privateKey: z.string().optional().describe("Private key to import (alternative to mnemonic)"),
      mnemonic: z.string().optional().describe("Mnemonic phrase to import (alternative to private key)"),
      name: z.string().optional().describe("Optional name for the wallet"),
    },
    async ({ privateKey, mnemonic, name }) => {
      try {
        const walletInfo = walletManager.importWallet(privateKey, mnemonic, name);
        return {
          content: [
            {
              type: "text",
              text: `Wallet imported successfully!\n\nAddress: ${walletInfo.address}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error importing wallet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // List Wallets Tool
  server.tool(
    "list_wallets",
    "List all available wallets",
    {},
    async () => {
      try {
        // This tool doesn't require authentication - it can list empty wallets
        const wallets = walletManager.listWallets();
        const currentAddress = walletManager.getCurrentAddress();

        let response = `Available Wallets (${wallets.length}):\n\n`;

        for (const wallet of wallets) {
          const isCurrent = wallet.address.toLowerCase() === currentAddress.toLowerCase();
          response += `${isCurrent ? '→ ' : '  '}${wallet.address}${isCurrent ? ' (current)' : ''}\n`;
        }

        return {
          content: [
            {
              type: "text",
              text: response,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing wallets: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Balance Tool
  server.tool(
    "get_balance",
    "Get the balance of a wallet address (native tokens or ERC20 tokens)",
    {
      address: z.string().describe("Wallet address to check balance for"),
      tokenAddress: z.string().optional().describe("Optional ERC20 token contract address"),
    },
    async ({ address, tokenAddress }) => {
      try {
        if (tokenAddress) {
          const tokenBalance = await rootstockClient.getTokenBalance(address, tokenAddress);
          return {
            content: [
              {
                type: "text",
                text: `Token Balance:\n\nAddress: ${address}\nToken: ${tokenBalance.name} (${tokenBalance.symbol})\nBalance: ${tokenBalance.balance} ${tokenBalance.symbol}`,
              },
            ],
          };
        } else {
          const balance = await rootstockClient.getBalance(address);
          return {
            content: [
              {
                type: "text",
                text: `Native Balance:\n\nAddress: ${address}\nBalance: ${balance} ${rootstockClient.getCurrencySymbol()}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting balance: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Native Balance Tool (dedicated for tRBTC)
  server.tool(
    "get_native_balance",
    "Get the native tRBTC balance of a wallet address on Rootstock testnet",
    {
      address: z.string().describe("Wallet address to check native balance for"),
    },
    async ({ address }) => {
      try {
        // This tool doesn't require authentication
        const balance = await rootstockClient.getBalance(address);
        const networkInfo = await rootstockClient.getNetworkInfo();

        return {
          content: [
            {
              type: "text",
              text: `Native tRBTC Balance:\n\nAddress: ${address}\nBalance: ${balance} ${rootstockClient.getCurrencySymbol()}\nNetwork: ${networkInfo.networkName} (Chain ID: ${networkInfo.chainId})\nBlock: ${networkInfo.blockNumber}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting native balance: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Send Transaction Tool
  server.tool(
    "send_transaction",
    "Send native tokens or ERC20 tokens to another address",
    {
      to: z.string().describe("Recipient address"),
      amount: z.string().describe("Amount to send (in token units, not wei)"),
      tokenAddress: z.string().optional().describe("Optional ERC20 token contract address (for token transfers)"),
      gasLimit: z.string().optional().describe("Optional gas limit"),
      gasPrice: z.string().optional().describe("Optional gas price"),
    },
    async ({ to, amount, tokenAddress, gasLimit, gasPrice }) => {
      try {
        // Check if wallet is configured (following hyperion-mcp-server pattern)
        let wallet;
        try {
          wallet = walletManager.getCurrentWallet();
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ No wallet configured for transactions!\n\n` +
                  `To send transactions, you need to configure your private key:\n\n` +
                  `🔧 **Via Smithery Interface (Recommended):**\n` +
                  `1. Click "Save & Connect" below\n` +
                  `2. Enter your funded private key for Rootstock testnet\n` +
                  `3. Example: 0x1234567890123456789012345678901234567890123456789012345678901234\n\n` +
                  `🔧 **Alternative Methods:**\n` +
                  `• Use 'import_wallet' tool to add your private key\n` +
                  `• Set ROOTSTOCK_PRIVATE_KEY environment variable\n\n` +
                  `Original error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }

        let result;
        if (tokenAddress) {
          result = await rootstockClient.sendTokenTransaction(
            wallet,
            tokenAddress,
            to,
            amount,
            gasLimit,
            gasPrice
          );
        } else {
          result = await rootstockClient.sendTransaction(
            wallet,
            to,
            amount,
            gasLimit,
            gasPrice
          );
        }

        return {
          content: [
            {
              type: "text",
              text: `Transaction sent successfully!\n\nHash: ${result.hash}\nFrom: ${result.from}\nTo: ${result.to}\nAmount: ${result.value}\nStatus: ${result.status}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error sending transaction: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Network Info Tool
  server.tool(
    "get_network_info",
    "Get current network information and status",
    {},
    async () => {
      try {
        const networkInfo = await rootstockClient.getNetworkInfo();
        return {
          content: [
            {
              type: "text",
              text: `Network Information:\n\nChain ID: ${networkInfo.chainId}\nNetwork: ${networkInfo.networkName}\nLatest Block: ${networkInfo.blockNumber}\nGas Price: ${networkInfo.gasPrice}\nConnected: ${networkInfo.isConnected}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting network info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Transaction Tool
  server.tool(
    "get_transaction",
    "Get details of a transaction by hash",
    {
      hash: z.string().describe("Transaction hash"),
    },
    async ({ hash }) => {
      try {
        const transaction = await rootstockClient.getTransaction(hash);
        return {
          content: [
            {
              type: "text",
              text: `Transaction Details:\n\nHash: ${transaction.hash}\nFrom: ${transaction.from}\nTo: ${transaction.to}\nValue: ${transaction.value}\nGas Used: ${transaction.gasUsed}\nStatus: ${transaction.status}\nBlock: ${transaction.blockNumber}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting transaction: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Block Tool
  server.tool(
    "get_block",
    "Get block information by number or hash",
    {
      blockNumber: z.number().optional().describe("Block number (alternative to blockHash)"),
      blockHash: z.string().optional().describe("Block hash (alternative to blockNumber)"),
    },
    async ({ blockNumber, blockHash }) => {
      try {
        const block = await rootstockClient.getBlock(blockNumber, blockHash);
        return {
          content: [
            {
              type: "text",
              text: `Block Information:\n\nNumber: ${block.number}\nHash: ${block.hash}\nTimestamp: ${new Date(block.timestamp * 1000).toISOString()}\nTransaction Count: ${block.transactionCount}\nGas Used: ${block.gasUsed}\nGas Limit: ${block.gasLimit}\nMiner: ${block.miner}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting block: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Estimate Gas Tool
  server.tool(
    "estimate_gas",
    "Estimate gas cost for a transaction",
    {
      to: z.string().describe("Recipient address"),
      value: z.string().optional().describe("Optional value to send (in ether)"),
      data: z.string().optional().describe("Optional transaction data"),
    },
    async ({ to, value, data }) => {
      try {
        const gasEstimate = await rootstockClient.estimateGas(to, value, data);
        return {
          content: [
            {
              type: "text",
              text: `Gas Estimation:\n\nEstimated Gas: ${gasEstimate.gasLimit}\nGas Price: ${gasEstimate.gasPrice}\nEstimated Cost: ${gasEstimate.estimatedCost} ${rootstockClient.getCurrencySymbol()}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error estimating gas: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Current Wallet Tool
  server.tool(
    "set_current_wallet",
    "Set the current active wallet for transactions",
    {
      address: z.string().describe("Wallet address to set as current"),
    },
    async ({ address }) => {
      try {
        // Note: WalletManager doesn't have setCurrentAddress method,
        // this would need to be implemented or use a different approach
        return {
          content: [
            {
              type: "text",
              text: `Note: Setting current wallet functionality needs to be implemented in WalletManager. Address: ${address}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting current wallet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Current Wallet Tool
  server.tool(
    "get_current_wallet",
    "Get the current active wallet information",
    {},
    async () => {
      try {
        const currentAddress = walletManager.getCurrentAddress();
        const wallet = walletManager.getCurrentWallet();
        return {
          content: [
            {
              type: "text",
              text: `Current Wallet:\n\nAddress: ${currentAddress}\nWallet Type: ${wallet.constructor.name}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting current wallet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Deploy ERC20 Token Tool
  server.tool(
    "deploy_erc20_token",
    "Deploy a new ERC20 token contract",
    {
      name: z.string().describe("Token name (e.g., 'My Token')"),
      symbol: z.string().describe("Token symbol (e.g., 'MTK')"),
      decimals: z.number().optional().describe("Token decimals (default: 18)"),
      initialSupply: z.string().describe("Initial token supply"),
      mintable: z.boolean().optional().describe("Whether token should be mintable (default: false)"),
      gasLimit: z.string().optional().describe("Gas limit for deployment"),
      gasPrice: z.string().optional().describe("Gas price for deployment"),
    },
    async ({ name, symbol, decimals, initialSupply, mintable, gasLimit, gasPrice }) => {
      try {
        // Check if wallet is configured (following hyperion-mcp-server pattern)
        const wallet = getWalletWithErrorHandling();

        const result = await rootstockClient.deployERC20Token(
          wallet,
          name,
          symbol,
          decimals || 18,
          initialSupply,
          mintable || false,
          gasLimit,
          gasPrice
        );

        const explorerUrl = rootstockClient.getExplorerUrl();
        return {
          content: [
            {
              type: "text",
              text: `ERC20 Token Deployed Successfully!\n\n` +
                    `Contract Address: ${result.contractAddress}\n` +
                    `Transaction Hash: ${result.transactionHash}\n` +
                    `Token Name: ${result.name}\n` +
                    `Token Symbol: ${result.symbol}\n` +
                    `Decimals: ${result.decimals}\n` +
                    `Initial Supply: ${result.initialSupply}\n` +
                    `Deployer: ${result.deployer}\n` +
                    `Gas Used: ${result.gasUsed || 'N/A'}\n` +
                    `Block Number: ${result.blockNumber || 'Pending'}\n\n` +
                    `Transaction Explorer: ${explorerUrl}/tx/${result.transactionHash}\n` +
                    `Contract Explorer: ${explorerUrl}/address/${result.contractAddress}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deploying ERC20 token: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Token Info Tool
  server.tool(
    "get_token_info",
    "Get comprehensive ERC20 token information including name, symbol, decimals, supply, and owner",
    {
      tokenAddress: z.string().describe("ERC20 token contract address"),
    },
    async ({ tokenAddress }) => {
      try {
        const result = await rootstockClient.getTokenInfo(tokenAddress);
        const explorerUrl = rootstockClient.getExplorerUrl();

        return {
          content: [
            {
              type: "text",
              text: `ERC20 Token Information:\n\n` +
                    `Contract Address: ${result.address}\n` +
                    `Name: ${result.name}\n` +
                    `Symbol: ${result.symbol}\n` +
                    `Decimals: ${result.decimals}\n` +
                    `Total Supply: ${result.totalSupply}\n` +
                    `Owner: ${result.owner || 'N/A'}\n\n` +
                    `Contract Explorer: ${explorerUrl}/address/${result.address}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting token info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Mint Tokens Tool
  server.tool(
    "mint_tokens",
    "Mint additional tokens for mintable ERC20 contracts (owner only)",
    {
      tokenAddress: z.string().describe("ERC20 token contract address"),
      to: z.string().describe("Address to mint tokens to"),
      amount: z.string().describe("Amount of tokens to mint"),
      gasLimit: z.string().optional().describe("Gas limit for minting"),
      gasPrice: z.string().optional().describe("Gas price for minting"),
    },
    async ({ tokenAddress, to, amount, gasLimit, gasPrice }) => {
      try {
        // Check if wallet is configured (following hyperion-mcp-server pattern)
        const wallet = getWalletWithErrorHandling();

        const result = await rootstockClient.mintTokens(
          wallet,
          tokenAddress,
          to,
          amount,
          gasLimit,
          gasPrice
        );

        const explorerUrl = rootstockClient.getExplorerUrl();
        return {
          content: [
            {
              type: "text",
              text: `Tokens Minted Successfully!\n\n` +
                    `Transaction Hash: ${result.hash}\n` +
                    `Token Contract: ${tokenAddress}\n` +
                    `Recipient: ${to}\n` +
                    `Amount Minted: ${amount}\n` +
                    `From: ${result.from}\n` +
                    `Gas Used: ${result.gasUsed || 'N/A'}\n` +
                    `Block Number: ${result.blockNumber || 'Pending'}\n\n` +
                    `Transaction Explorer: ${explorerUrl}/tx/${result.hash}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error minting tokens: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Deploy ERC721 NFT Token Tool
  server.tool(
    "deploy_erc721_token",
    "Deploy a new ERC721 (NFT) token contract",
    {
      name: z.string().describe("NFT collection name (e.g., 'My NFT Collection')"),
      symbol: z.string().describe("NFT collection symbol (e.g., 'MYNFT')"),
      mintable: z.boolean().optional().describe("Whether NFT should be mintable (default: false)"),
      gasLimit: z.string().optional().describe("Gas limit for deployment"),
      gasPrice: z.string().optional().describe("Gas price for deployment"),
    },
    async ({ name, symbol, mintable, gasLimit, gasPrice }) => {
      try {
        // Check if wallet is configured (following hyperion-mcp-server pattern)
        const wallet = getWalletWithErrorHandling();

        const result = await rootstockClient.deployERC721Token(
          wallet,
          name,
          symbol,
          mintable || false,
          gasLimit,
          gasPrice
        );

        const explorerUrl = rootstockClient.getExplorerUrl();
        return {
          content: [
            {
              type: "text",
              text: `ERC721 NFT Contract Deployed Successfully!\n\n` +
                    `Contract Address: ${result.contractAddress}\n` +
                    `Transaction Hash: ${result.transactionHash}\n` +
                    `NFT Collection Name: ${result.name}\n` +
                    `NFT Collection Symbol: ${result.symbol}\n` +
                    `Deployer: ${result.deployer}\n` +
                    `Gas Used: ${result.gasUsed || 'N/A'}\n` +
                    `Block Number: ${result.blockNumber || 'Pending'}\n\n` +
                    `Transaction Explorer: ${explorerUrl}/tx/${result.transactionHash}\n` +
                    `Contract Explorer: ${explorerUrl}/address/${result.contractAddress}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deploying ERC721 token: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get NFT Info Tool
  server.tool(
    "get_nft_info",
    "Get comprehensive ERC721 NFT information including collection details and specific token info",
    {
      tokenAddress: z.string().describe("ERC721 NFT contract address"),
      tokenId: z.string().optional().describe("Optional token ID to get specific token info"),
    },
    async ({ tokenAddress, tokenId }) => {
      try {
        const result = await rootstockClient.getNFTInfo(tokenAddress, tokenId);
        const explorerUrl = rootstockClient.getExplorerUrl();

        return {
          content: [
            {
              type: "text",
              text: `ERC721 NFT Information:\n\n` +
                    `Contract Address: ${result.address}\n` +
                    `Collection Name: ${result.name}\n` +
                    `Collection Symbol: ${result.symbol}\n` +
                    `Total Supply: ${result.totalSupply}\n` +
                    `${result.tokenId ? `Token ID: ${result.tokenId}\n` : ''}` +
                    `${result.tokenURI ? `Token URI: ${result.tokenURI}\n` : ''}` +
                    `${result.owner ? `Token Owner: ${result.owner}\n` : ''}\n` +
                    `Contract Explorer: ${explorerUrl}/address/${result.address}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting NFT info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Mint NFT Tool
  server.tool(
    "mint_nft",
    "Mint a new NFT for mintable ERC721 contracts (owner only)",
    {
      tokenAddress: z.string().describe("ERC721 NFT contract address"),
      to: z.string().describe("Address to mint NFT to"),
      tokenId: z.string().describe("Unique token ID for the new NFT"),
      tokenURI: z.string().optional().describe("Metadata URI for the NFT (optional)"),
      gasLimit: z.string().optional().describe("Gas limit for minting"),
      gasPrice: z.string().optional().describe("Gas price for minting"),
    },
    async ({ tokenAddress, to, tokenId, tokenURI, gasLimit, gasPrice }) => {
      try {
        // Check if wallet is configured (following hyperion-mcp-server pattern)
        const wallet = getWalletWithErrorHandling();

        const result = await rootstockClient.mintNFT(
          wallet,
          tokenAddress,
          to,
          tokenId,
          tokenURI || '',
          gasLimit,
          gasPrice
        );

        const explorerUrl = rootstockClient.getExplorerUrl();
        return {
          content: [
            {
              type: "text",
              text: `NFT Minted Successfully!\n\n` +
                    `Transaction Hash: ${result.transactionHash}\n` +
                    `NFT Contract: ${tokenAddress}\n` +
                    `Recipient: ${result.to}\n` +
                    `Token ID: ${result.tokenId}\n` +
                    `${result.tokenURI ? `Token URI: ${result.tokenURI}\n` : ''}` +
                    `Gas Used: ${result.gasUsed || 'N/A'}\n` +
                    `Block Number: ${result.blockNumber || 'Pending'}\n\n` +
                    `Transaction Explorer: ${explorerUrl}/tx/${result.transactionHash}\n` +
                    `Contract Explorer: ${explorerUrl}/address/${tokenAddress}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error minting NFT: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  return server.server;
}

// For Smithery deployment - create and start the server
// Check if this file is being run directly (works in both ESM and CommonJS)
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('smithery-server.js') ||
  process.argv[1].endsWith('smithery-server.ts') ||
  process.argv[1].includes('smithery-server')
);

if (isDirectExecution) {
  const privateKey = process.env.ROOTSTOCK_PRIVATE_KEYS || process.env.HYPERION_PRIVATE_KEYS;

  const defaultConfig = {
    privateKey: privateKey ? privateKey.split(',')[0] : undefined, // Use first private key if multiple provided
    rpcUrl: process.env.ROOTSTOCK_RPC_URL || process.env.HYPERION_RPC_URL || 'https://public-node.testnet.rsk.co',
    chainId: parseInt(process.env.ROOTSTOCK_CHAIN_ID || process.env.HYPERION_CHAIN_ID || '31'),
    networkName: process.env.ROOTSTOCK_NETWORK_NAME || process.env.HYPERION_NETWORK_NAME || 'Rootstock Testnet',
    explorerUrl: process.env.ROOTSTOCK_EXPLORER_URL || process.env.HYPERION_EXPLORER_URL || 'https://explorer.testnet.rootstock.io',
    currencySymbol: process.env.ROOTSTOCK_CURRENCY_SYMBOL || process.env.HYPERION_CURRENCY_SYMBOL || 'tRBTC',
    debug: process.env.DEBUG === 'true' || false,
  };

  const server = createStatelessServer({ config: defaultConfig });

  // Start the server with stdio transport
  const transport = new StdioServerTransport();
  server.connect(transport).catch((error) => {
    console.error("Failed to start Rootstock MCP Server:", error);
    process.exit(1);
  });
}

// Export for Smithery deployment
function createServer(options: { sessionId?: string; config?: any } = {}) {
  const { sessionId, config } = options;

  // Set up default configuration with Smithery config override (following hyperion pattern)
  const serverConfig: z.infer<typeof configSchema> = {
    privateKey: config?.privateKey,
    rpcUrl: config?.rpcUrl || 'https://public-node.testnet.rsk.co',
    chainId: config?.chainId || 31,
    networkName: config?.networkName || 'Rootstock Testnet',
    explorerUrl: config?.explorerUrl || 'https://explorer.testnet.rootstock.io',
    currencySymbol: config?.currencySymbol || 'tRBTC',
    debug: config?.debug || false,
  };

  // Create and return the server instance
  return createStatelessServer({ config: serverConfig });
}

// Export as both ES module and CommonJS for Smithery compatibility
export default createServer;
module.exports = createServer;
module.exports.default = createServer;
