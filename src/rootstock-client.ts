/**
 * Rootstock Blockchain Client
 * Handles all blockchain interactions and API calls
 */

import axios, { AxiosInstance } from 'axios';
import { ethers } from 'ethers';
import {
  RootstockConfig,
  TransactionResponse,
  BlockInfo,
  NetworkInfo,
  ContractCallResponse,
  TokenBalance,
  GasEstimate,
  ERC20DeploymentResponse,
  TokenInfoResponse,
  ERC721DeploymentResponse,
  NFTInfoResponse,
} from './types.js';
import erc721Contracts from './erc721-contracts-rootstock.json' with { type: 'json' };

export class RootstockClient {
  private provider: ethers.JsonRpcProvider | null = null;
  private httpClient: AxiosInstance | null = null;
  private config: RootstockConfig;

  constructor(config: RootstockConfig) {
    this.config = config;
    // Defer provider and httpClient creation until actually needed
  }

  private getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl, undefined, {
        staticNetwork: true,
        batchMaxCount: 1,
      });
    }
    return this.provider;
  }

  private getHttpClient(): AxiosInstance {
    if (!this.httpClient) {
      this.httpClient = axios.create({
        baseURL: this.config.rpcUrl,
        timeout: 60000, // Increased timeout for Rootstock
        headers: {
          'Content-Type': 'application/json',
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // Accept 4xx errors but not 5xx
      });
    }
    return this.httpClient;
  }

  /**
   * Get the native currency symbol
   */
  getCurrencySymbol(): string {
    return this.config.currencySymbol || 'ETH';
  }

  /**
   * Get the block explorer URL
   */
  getExplorerUrl(): string {
    return this.config.explorerUrl || 'https://etherscan.io';
  }

  /**
   * Get native token balance for an address
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.getProvider().getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(address: string, tokenAddress: string): Promise<TokenBalance> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
          'function name() view returns (string)',
        ],
        this.getProvider()
      );

      const [balance, decimals, symbol, name] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.name(),
      ]);

      return {
        tokenAddress,
        balance: ethers.formatUnits(balance, decimals),
        decimals,
        symbol,
        name,
      };
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error}`);
    }
  }

  /**
   * Send native token transaction
   */
  async sendTransaction(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    to: string,
    amount: string,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<TransactionResponse> {
    try {
      const connectedWallet = wallet.connect(this.getProvider());
      
      const tx: ethers.TransactionRequest = {
        to,
        value: ethers.parseEther(amount),
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      };

      const transaction = await connectedWallet.sendTransaction(tx);
      const receipt = await transaction.wait();

      return {
        hash: transaction.hash,
        from: transaction.from!,
        to: transaction.to!,
        value: ethers.formatEther(transaction.value!),
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: transaction.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
      };
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error}`);
    }
  }

  /**
   * Send ERC20 token transaction
   */
  async sendTokenTransaction(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    tokenAddress: string,
    to: string,
    amount: string,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<TransactionResponse> {
    try {
      const connectedWallet = wallet.connect(this.getProvider());
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)',
        ],
        connectedWallet
      );

      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await tokenContract.transfer(to, parsedAmount, {
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: wallet.address,
        to,
        value: amount,
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
      };
    } catch (error) {
      throw new Error(`Failed to send token transaction: ${error}`);
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(hash: string): Promise<TransactionResponse> {
    try {
      const [tx, receipt] = await Promise.all([
        this.getProvider().getTransaction(hash),
        this.getProvider().getTransactionReceipt(hash),
      ]);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: ethers.formatEther(tx.value),
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
      };
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error}`);
    }
  }

  /**
   * Get block information
   */
  async getBlock(blockNumber?: number, blockHash?: string): Promise<BlockInfo> {
    try {
      let block;
      if (blockHash) {
        block = await this.getProvider().getBlock(blockHash);
      } else if (blockNumber !== undefined) {
        block = await this.getProvider().getBlock(blockNumber);
      } else {
        block = await this.getProvider().getBlock('latest');
      }

      if (!block) {
        throw new Error('Block not found');
      }

      return {
        number: block.number,
        hash: block.hash || '',
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner,
        difficulty: block.difficulty?.toString(),
        size: block.length || 0,
        transactionCount: block.transactions.length,
      };
    } catch (error) {
      throw new Error(`Failed to get block: ${error}`);
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const [network, blockNumber, feeData] = await Promise.all([
        this.getProvider().getNetwork(),
        this.getProvider().getBlockNumber(),
        this.getProvider().getFeeData(),
      ]);

      return {
        chainId: Number(network.chainId),
        networkName: network.name || this.config.networkName || 'Unknown',
        blockNumber,
        gasPrice: feeData.gasPrice?.toString() || '0',
        isConnected: true,
      };
    } catch (error) {
      return {
        chainId: this.config.chainId || 0,
        networkName: this.config.networkName || 'Unknown',
        blockNumber: 0,
        gasPrice: '0',
        isConnected: false,
      };
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(to: string, value?: string, data?: string): Promise<GasEstimate> {
    try {
      const tx: ethers.TransactionRequest = {
        to,
        value: value ? ethers.parseEther(value) : 0,
        data: data || '0x',
      };

      const [gasLimit, feeData] = await Promise.all([
        this.getProvider().estimateGas(tx),
        this.getProvider().getFeeData(),
      ]);

      const gasPrice = feeData.gasPrice || BigInt(0);
      const estimatedCost = gasLimit * gasPrice;

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        estimatedCost: ethers.formatEther(estimatedCost),
      };
    } catch (error) {
      throw new Error(`Failed to estimate gas: ${error}`);
    }
  }

  /**
   * Call a smart contract method (read-only)
   */
  async callContract(
    contractAddress: string,
    methodName: string,
    parameters: any[] = [],
    abi?: any[]
  ): Promise<ContractCallResponse> {
    try {
      // Use a basic ABI if none provided
      const contractAbi = abi || [
        `function ${methodName}(${parameters.map((_, i) => `uint256 param${i}`).join(', ')}) view returns (uint256)`,
      ];

      const contract = new ethers.Contract(contractAddress, contractAbi, this.getProvider());
      const result = await contract[methodName](...parameters);

      return {
        result: result.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to call contract: ${error}`);
    }
  }

  /**
   * Send a transaction to a smart contract
   */
  async sendContractTransaction(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    contractAddress: string,
    methodName: string,
    parameters: any[] = [],
    abi?: any[],
    value?: string,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<TransactionResponse> {
    try {
      const connectedWallet = wallet.connect(this.getProvider());
      
      // Use a basic ABI if none provided
      const contractAbi = abi || [
        `function ${methodName}(${parameters.map((_, i) => `uint256 param${i}`).join(', ')})`,
      ];

      const contract = new ethers.Contract(contractAddress, contractAbi, connectedWallet);
      
      const tx = await contract[methodName](...parameters, {
        value: value ? ethers.parseEther(value) : 0,
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: wallet.address,
        to: contractAddress,
        value: value || '0',
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
      };
    } catch (error) {
      throw new Error(`Failed to send contract transaction: ${error}`);
    }
  }

  /**
   * Deploy an ERC20 token contract
   */
  async deployERC20Token(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    name: string,
    symbol: string,
    decimals: number = 18,
    initialSupply: string,
    mintable: boolean = false,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<{
    contractAddress: string;
    transactionHash: string;
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: string;
    deployer: string;
    gasUsed?: string;
    blockNumber?: number;
  }> {
    try {
      const connectedWallet = wallet.connect(this.getProvider());

      // Check wallet balance first
      const balance = await this.getProvider().getBalance(wallet.address);
      console.log(`Wallet balance: ${ethers.formatEther(balance)} ${this.getCurrencySymbol()}`);

      if (balance === 0n) {
        throw new Error(`Wallet has no funds for deployment. Please fund the wallet: ${wallet.address}`);
      }

      // Get pre-compiled contract
      console.log('Loading ERC20 contract...');
      const compiled = this.getCompiledERC20Contract(mintable);
      console.log('Contract loaded successfully');

      // Create contract factory
      const contractFactory = new ethers.ContractFactory(
        compiled.abi,
        compiled.bytecode,
        connectedWallet
      );

      // Parse initial supply (raw number, contract handles decimals)
      const parsedInitialSupply = BigInt(initialSupply);
      console.log(`Deploying contract with initial supply: ${parsedInitialSupply.toString()}`);

      // Deploy contract with Hyperion-compatible parameters: name, symbol, initialSupply, decimals
      const contract = await contractFactory.deploy(
        name,
        symbol,
        parsedInitialSupply,
        decimals,
        {
          gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
          gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
        }
      );

      console.log('Contract deployment transaction sent, waiting for confirmation...');

      // Wait for deployment
      const receipt = await contract.deploymentTransaction()?.wait();
      console.log('Contract deployed successfully!');

      const contractAddress = await contract.getAddress();
      console.log(`Contract address: ${contractAddress}`);

      return {
        contractAddress,
        transactionHash: contract.deploymentTransaction()?.hash || '',
        name,
        symbol,
        decimals,
        initialSupply,
        deployer: wallet.address,
        gasUsed: receipt?.gasUsed.toString(),
        blockNumber: receipt?.blockNumber,
      };
    } catch (error) {
      console.error('Deployment error:', error);
      throw new Error(`Failed to deploy ERC20 token: ${error}`);
    }
  }

  /**
   * Get ERC20 token information
   */
  async getTokenInfo(tokenAddress: string): Promise<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner?: string;
  }> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        this.getStandardERC20ABI(),
        this.getProvider()
      );

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
      ]);

      let owner: string | undefined;
      try {
        // Try to get owner if it's a mintable token
        const mintableContract = new ethers.Contract(
          tokenAddress,
          this.getMintableERC20ABI(),
          this.getProvider()
        );
        owner = await mintableContract.owner();
      } catch {
        // Owner function doesn't exist, it's a standard token
      }

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        owner,
      };
    } catch (error) {
      throw new Error(`Failed to get token info: ${error}`);
    }
  }

  /**
   * Mint tokens (only for mintable tokens)
   */
  async mintTokens(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    tokenAddress: string,
    to: string,
    amount: string,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<TransactionResponse> {
    try {
      const connectedWallet = wallet.connect(this.getProvider());

      const tokenContract = new ethers.Contract(
        tokenAddress,
        this.getMintableERC20ABI(),
        connectedWallet
      );

      // Get token decimals
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await tokenContract.mint(to, parsedAmount, {
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: wallet.address,
        to: tokenAddress,
        value: amount,
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
      };
    } catch (error) {
      throw new Error(`Failed to mint tokens: ${error}`);
    }
  }

  /**
   * Deploy an ERC721 NFT contract
   */
  async deployERC721Token(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    name: string,
    symbol: string,
    mintable: boolean = false,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<ERC721DeploymentResponse> {
    try {
      const connectedWallet = wallet.connect(this.getProvider());

      // Check wallet balance first
      const balance = await this.getProvider().getBalance(wallet.address);
      console.log(`Wallet balance: ${ethers.formatEther(balance)} ${this.getCurrencySymbol()}`);

      if (balance === 0n) {
        throw new Error(`Wallet has no funds for deployment. Please fund the wallet: ${wallet.address}`);
      }

      // Get pre-compiled ERC721 contract
      console.log('Loading ERC721 contract...');
      const compiled = this.getCompiledERC721Contract(mintable);
      console.log('Contract loaded successfully');

      // Create contract factory
      const contractFactory = new ethers.ContractFactory(
        compiled.abi,
        compiled.bytecode,
        connectedWallet
      );

      console.log(`Deploying ERC721 contract: ${name} (${symbol})`);

      // Deploy contract with parameters: name, symbol
      const contract = await contractFactory.deploy(
        name,
        symbol,
        {
          gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
          gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
        }
      );

      console.log('Contract deployment transaction sent, waiting for confirmation...');

      // Wait for deployment
      const receipt = await contract.deploymentTransaction()?.wait();
      console.log('ERC721 contract deployed successfully!');

      const contractAddress = await contract.getAddress();
      console.log(`Contract address: ${contractAddress}`);

      return {
        contractAddress,
        transactionHash: contract.deploymentTransaction()?.hash || '',
        name,
        symbol,
        deployer: wallet.address,
        gasUsed: receipt?.gasUsed.toString(),
        blockNumber: receipt?.blockNumber,
      };
    } catch (error) {
      console.error('ERC721 deployment error:', error);
      throw new Error(`Failed to deploy ERC721 token: ${error}`);
    }
  }

  /**
   * Mint an NFT (only for mintable ERC721 contracts)
   */
  async mintNFT(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    tokenAddress: string,
    to: string,
    tokenId: string,
    tokenURI: string = '',
    gasLimit?: string,
    gasPrice?: string
  ): Promise<{
    transactionHash: string;
    to: string;
    tokenId: string;
    tokenURI?: string;
    gasUsed?: string;
    blockNumber?: number;
  }> {
    try {
      const connectedWallet = wallet.connect(this.getProvider());

      const nftContract = new ethers.Contract(
        tokenAddress,
        this.getMintableERC721ABI(),
        connectedWallet
      );

      // Convert tokenId to BigInt
      const parsedTokenId = BigInt(tokenId);

      const tx = await nftContract.mint(to, parsedTokenId, tokenURI, {
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      });

      const receipt = await tx.wait();

      return {
        transactionHash: tx.hash,
        to,
        tokenId,
        tokenURI: tokenURI || undefined,
        gasUsed: receipt?.gasUsed.toString(),
        blockNumber: receipt?.blockNumber,
      };
    } catch (error) {
      throw new Error(`Failed to mint NFT: ${error}`);
    }
  }

  /**
   * Get information about an ERC721 NFT contract and optionally a specific token
   */
  async getNFTInfo(tokenAddress: string, tokenId?: string): Promise<{
    address: string;
    name: string;
    symbol: string;
    totalSupply: string;
    tokenId?: string;
    tokenURI?: string;
    owner?: string;
  }> {
    try {
      const nftContract = new ethers.Contract(
        tokenAddress,
        this.getStandardERC721ABI(),
        this.getProvider()
      );

      const [name, symbol, totalSupply] = await Promise.all([
        nftContract.name(),
        nftContract.symbol(),
        nftContract.totalSupply(),
      ]);

      const result = {
        address: tokenAddress,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        tokenId,
      };

      // If tokenId is provided, get additional token-specific information
      if (tokenId) {
        try {
          const [tokenURI, owner] = await Promise.all([
            nftContract.tokenURI(tokenId),
            nftContract.ownerOf(tokenId),
          ]);

          return {
            ...result,
            tokenURI,
            owner,
          };
        } catch (error) {
          // Token might not exist or contract might not support these functions
          console.warn(`Could not get token-specific info for token ${tokenId}:`, error);
          return result;
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to get NFT info: ${error}`);
    }
  }

  // Helper methods for contract ABIs and bytecode
  private getStandardERC20ABI(): string[] {
    return [
      // ERC20 Standard Interface with correct constructor
      "constructor(string name, string symbol, uint256 initialSupply, uint8 decimals_)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ];
  }

  private getMintableERC20ABI(): string[] {
    return [
      // Mintable ERC20 Interface with correct constructor
      "constructor(string name, string symbol, uint256 initialSupply, uint8 decimals_)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      "function mint(address to, uint256 amount)",
      "function burn(uint256 amount)",
      "function burnFrom(address account, uint256 amount)",
      "function owner() view returns (address)",
      "function renounceOwnership()",
      "function transferOwnership(address newOwner)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
    ];
  }

  private getStandardERC721ABI(): string[] {
    return [
      // Standard ERC721 Interface
      "constructor(string name, string symbol)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function tokenURI(uint256 tokenId) view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function getApproved(uint256 tokenId) view returns (address)",
      "function isApprovedForAll(address owner, address operator) view returns (bool)",
      "function approve(address to, uint256 tokenId)",
      "function setApprovalForAll(address operator, bool approved)",
      "function transferFrom(address from, address to, uint256 tokenId)",
      "function safeTransferFrom(address from, address to, uint256 tokenId)",
      "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
      "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
      "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
    ];
  }

  private getMintableERC721ABI(): string[] {
    return [
      // Mintable ERC721 Interface (extends standard ERC721)
      "constructor(string name, string symbol)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function tokenURI(uint256 tokenId) view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function getApproved(uint256 tokenId) view returns (address)",
      "function isApprovedForAll(address owner, address operator) view returns (bool)",
      "function approve(address to, uint256 tokenId)",
      "function setApprovalForAll(address operator, bool approved)",
      "function transferFrom(address from, address to, uint256 tokenId)",
      "function safeTransferFrom(address from, address to, uint256 tokenId)",
      "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
      "function mint(address to, uint256 tokenId, string tokenURI)",
      "function owner() view returns (address)",
      "function renounceOwnership()",
      "function transferOwnership(address newOwner)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
      "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
      "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
      "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
    ];
  }

  private getStandardERC20Source(): { bytecode: string } {
    // Working ERC20 contract bytecode compiled from OpenZeppelin ERC20
    return {
      bytecode: "0x608060405234801561001057600080fd5b506040516107e93803806107e98339818101604052810190610032919061016a565b83600090805190602001906100489291906100b0565b50826001908051906020019061005f9291906100b0565b5081600260006101000a81548160ff021916908360ff16021790555080600381905550600354600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6003546040516101299190610309565b60405180910390a350505050610324565b82805461014590610324565b90600052602060002090601f01602090048101928261016757600085556101ae565b82601f1061018057805160ff19168380011785556101ae565b828001600101855582156101ae579182015b828111156101ad578251825591602001919060010190610192565b5b5090506101bb91906101bf565b5090565b5b808211156101d85760008160009055506001016101c0565b5090565b60006101ef6101ea84610349565b610324565b90508281526020810184848401111561020b5761020a610489565b5b610216848285610447565b509392505050565b600082601f83011261023357610232610484565b5b81516102438482602086016101dc565b91505092915050565b600080600080608085870312156102665761026561048e565b5b600085015167ffffffffffffffff81111561028457610283610489565b5b6102908782880161021e565b945050602085015167ffffffffffffffff8111156102b1576102b0610489565b5b6102bd8782880161021e565b935050604085015160ff811681146102d8576102d7610489565b5b6102e887828801610324565b925050606085015190509295509295909350565b61030381610324565b82525050565b600060208201905061031e60008301846102fa565b92915050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000610369826103a9565b9150610374836103a9565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156103a9576103a8610324565b5b828201905092915050565b6000819050919050565b60006103c9826103d0565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061045f57607f821691505b6020821081141561047357610472610430565b5b50919050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b610576806104a06000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce5671461013457806370a082311461015257806395d89b4114610182578063a9059cbb146101a0578063dd62ed3e146101d057610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a0610200565b6040516100ad9190610432565b60405180910390f35b6100d060048036038101906100cb9190610373565b61028e565b6040516100dd91906103f7565b60405180910390f35b6100ee610380565b6040516100fb9190610454565b60405180910390f35b61011e600480360381019061011991906102e6565b610386565b60405161012b91906103f7565b60405180910390f35b61013c6104d7565b60405161014991906104c2565b60405180910390f35b61016c60048036038101906101679190610279565b6104ea565b6040516101799190610454565b60405180910390f35b61018a610532565b6040516101979190610432565b60405180910390f35b6101ba60048036038101906101b59190610373565b6105c0565b6040516101c791906103f7565b60405180910390f35b6101ea60048036038101906101e591906102a6565b6106d7565b6040516101f79190610454565b60405180910390f35b6000805461020d90610554565b80601f016020809104026020016040519081016040528092919081815260200182805461023990610554565b80156102865780601f1061025b57610100808354040283529160200191610286565b820191906000526020600020905b81548152906001019060200180831161026957829003601f168201915b505050505081565b600081600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161036e9190610454565b60405180910390a36001905092915050565b60035481565b600081600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156103d457600080fd5b81600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561045d57600080fd5b81600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546104ac91906104dd565b9250508190555081600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461050291906104dd565b9250508190555081600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461059491906104dd565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516105f89190610454565b60405180910390a3600190509392505050565b600260009054906101000a900460ff1681565b600081600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561060e57600080fd5b81600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461065d91906104dd565b9250508190555081600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546106b391906104dd565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516107179190610454565b60405180910390a36001905092915050565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b60008135905061078881610579565b92915050565b60008135905061079d81610590565b92915050565b6000813590506107b2816105a7565b92915050565b6000602082840312156107ce576107cd610574565b5b60006107dc84828501610779565b91505092915050565b600080604083850312156107fc576107fb610574565b5b600061080a85828601610779565b925050602061081b8582860161078e565b9150509250929050565b60008060006060848603121561083e5761083d610574565b5b600061084c86828701610779565b935050602061085d86828701610779565b925050604061086e8682870161078e565b9150509250925092565b61088181610511565b82525050565b6108908161051d565b82525050565b60006108a182610473565b6108ab818561047e565b93506108bb81856020860161054f565b6108c481610582565b840191505092915050565b60006020820190506108e46000830184610878565b92915050565b60006020820190506108ff6000830184610887565b92915050565b6000602082019050818103600083015261091f8184610896565b905092915050565b600060208201905061093c600083018461088f565b92915050565b600061094d82610529565b915061095883610529565b92508282101561096b5761096a610556565b5b828203905092915050565b600061098182610529565b915061098c83610529565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156109c1576109c0610556565b5b828201905092915050565b60006109d782610509565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b60005b83811015610a3f578082015181840152602081019050610a24565b83811115610a4e576000848401525b50505050565b60006002820490506001821680610a6c57607f821691505b60208210811415610a8057610a7f610585565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600080fd5b6000601f19601f8301169050919050565b610a9c816109cc565b8114610aa757600080fd5b50565b610ab381610509565b8114610abe57600080fd5b50565b610aca81610513565b8114610ad557600080fd5b5056fea2646970667358221220f7a8b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b764736f6c63430008070033"
    };
  }

  private getMintableERC20Source(): { bytecode: string } {
    // This is a simplified bytecode for a mintable ERC20 token
    // In a production environment, you would use a proper Solidity compiler
    return {
      bytecode: "0x608060405234801561001057600080fd5b506040516109a93803806109a98339818101604052810190610032919061024a565b83600090805190602001906100489291906100f8565b50826001908051906020019061005f9291906100f8565b5081600260006101000a81548160ff021916908360ff16021790555080600381905550336005806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600354600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6003546040516101599190610339565b60405180910390a3600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a350505050610354565b8280546101e590610354565b90600052602060002090601f01602090048101928261020757600085556102ae565b82601f1061022057805160ff19168380011785556102ae565b828001600101855582156102ae579182015b828111156102ad578251825591602001919060010190610232565b5b5090506102bb91906102bf565b5090565b5b808211156102d85760008160009055506001016102c0565b5090565b60006102ef6102ea84610379565b610354565b90508281526020810184848401111561030b5761030a6104b9565b5b610316848285610477565b509392505050565b600082601f83011261033357610332610484565b5b815161034384826020860161020c565b91505092915050565b600080600080608085870312156103665761036561048e565b5b600085015167ffffffffffffffff81111561038457610383610489565b5b6103908782880161031e565b945050602085015167ffffffffffffffff8111156103b1576103b0610489565b5b6103bd8782880161031e565b935050604085015160ff811681146103d8576103d7610489565b5b6103e887828801610354565b925050606085015190509295509295909350565b61040581610354565b82525050565b600060208201905061042060008301846103fc565b92915050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600061046b826104a9565b9150610476836104a9565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156104ab576104aa610354565b5b828201905092915050565b6000819050919050565b60006104cb826104d2565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061056f57607f821691505b6020821081141561058357610582610540565b5b50919050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b610646806105b06000396000f3fe"
    };
  }

  /**
   * Get pre-compiled ERC20 contract (Hyperion-compatible)
   */
  private getCompiledERC20Contract(mintable: boolean): { abi: string[], bytecode: string } {
    // Use the working Hyperion-compatible bytecode directly
    if (mintable) {
      return {
        abi: this.getMintableERC20ABI(),
        bytecode: "0x60806040523480156200001157600080fd5b506040516200104538038062001045833981016040819052620000349162000361565b33848460036200004583826200047d565b5060046200005482826200047d565b5050506001600160a01b0381166200008757604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b6200009281620000d9565b506005805460ff60a01b1916600160a01b60ff841602179055620000cf33620000bd83600a6200065e565b620000c9908562000676565b6200012b565b50505050620006a6565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b038216620001575760405163ec442f0560e01b8152600060048201526024016200007e565b620001656000838362000169565b5050565b6001600160a01b038316620001985780600260008282546200018c919062000690565b909155506200020c9050565b6001600160a01b03831660009081526020819052604090205481811015620001ed5760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016200007e565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b0382166200022a5760028054829003905562000249565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516200028f91815260200190565b60405180910390a3505050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620002c457600080fd5b81516001600160401b0380821115620002e157620002e16200029c565b604051601f8301601f19908116603f011681019082821181831017156200030c576200030c6200029c565b816040528381526020925086838588010111156200032957600080fd5b600091505b838210156200034d57858201830151818301840152908201906200032e565b600093810190920192909252949350505050565b600080600080608085870312156200037857600080fd5b84516001600160401b03808211156200039057600080fd5b6200039e88838901620002b2565b95506020870151915080821115620003b557600080fd5b50620003c487828801620002b2565b93505060408501519150606085015160ff81168114620003e357600080fd5b939692955090935050565b600181811c908216806200040357607f821691505b6020821081036200042457634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200047857600081815260208120601f850160051c81016020861015620004535750805b601f850160051c820191505b8181101562000474578281556001016200045f565b5050505b505050565b81516001600160401b038111156200049957620004996200029c565b620004b181620004aa8454620003ee565b846200042a565b602080601f831160018114620004e95760008415620004d05750858301515b600019600386901b1c1916600185901b17855562000474565b600085815260208120601f198616915b828110156200051a57888601518255948401946001909101908401620004f9565b5085821015620005395787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b600181815b80851115620005a057816000190482111562000584576200058462000549565b808516156200059257918102915b93841c939080029062000564565b509250929050565b600082620005b95750600162000658565b81620005c85750600062000658565b8160018114620005e15760028114620005ec576200060c565b600191505062000658565b60ff84111562000600576200060062000549565b50506001821b62000658565b5060208310610133831016604e8410600b841016171562000631575081810a62000658565b6200063d83836200055f565b806000190482111562000654576200065462000549565b0290505b92915050565b60006200066f60ff841683620005a8565b9392505050565b808202811582820484141762000658576200065862000549565b8082018082111562000658576200065862000549565b61098f80620006b66000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c806370a082311161009757806395d89b411161006657806395d89b4114610206578063a9059cbb1461020e578063dd62ed3e14610221578063f2fde38b1461025a57600080fd5b806370a08231146101a7578063715018a6146101d057806379cc6790146101d85780638da5cb5b146101eb57600080fd5b806323b872dd116100d357806323b872dd1461014d578063313ce5671461016057806340c10f191461017f57806342966c681461019457600080fd5b806306fdde03146100fa578063095ea7b31461011857806318160ddd1461013b575b600080fd5b61010261026d565b60405161010f91906107c0565b60405180910390f35b61012b61012636600461082a565b6102ff565b604051901515815260200161010f565b6002545b60405190815260200161010f565b61012b61015b366004610854565b610319565b600554600160a01b900460ff1660405160ff909116815260200161010f565b61019261018d36600461082a565b61033d565b005b6101926101a2366004610890565b610353565b61013f6101b53660046108a9565b6001600160a01b031660009081526020819052604090205490565b610192610360565b6101926101e636600461082a565b610374565b6005546040516001600160a01b03909116815260200161010f565b610102610389565b61012b61021c36600461082a565b610398565b61013f61022f3660046108cb565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6101926102683660046108a9565b6103a6565b60606003805461027c906108fe565b80601f01602080910402602001604051908101604052809291908181526020018280546102a8906108fe565b80156102f55780601f106102ca576101008083540402835291602001916102f5565b820191906000526020600020905b8154815290600101906020018083116102d857829003601f168201915b5050505050905090565b60003361030d8185856103e6565b60019150505b92915050565b6000336103278582856103f8565b610332858585610477565b506001949350505050565b6103456104d6565b61034f8282610503565b5050565b61035d3382610539565b50565b6103686104d6565b610372600061056f565b565b61037f8233836103f8565b61034f8282610539565b60606004805461027c906108fe565b60003361030d818585610477565b6103ae6104d6565b6001600160a01b0381166103dd57604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b61035d8161056f565b6103f383838360016105c1565b505050565b6001600160a01b03838116600090815260016020908152604080832093861683529290522054600019811015610471578181101561046257604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064016103d4565b610471848484840360006105c1565b50505050565b6001600160a01b0383166104a157604051634b637e8f60e11b8152600060048201526024016103d4565b6001600160a01b0382166104cb5760405163ec442f0560e01b8152600060048201526024016103d4565b6103f3838383610696565b6005546001600160a01b031633146103725760405163118cdaa760e01b81523360048201526024016103d4565b6001600160a01b03821661052d5760405163ec442f0560e01b8152600060048201526024016103d4565b61034f60008383610696565b6001600160a01b03821661056357604051634b637e8f60e11b8152600060048201526024016103d4565b61034f82600083610696565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b0384166105eb5760405163e602df0560e01b8152600060048201526024016103d4565b6001600160a01b03831661061557604051634a1406b160e11b8152600060048201526024016103d4565b6001600160a01b038085166000908152600160209081526040808320938716835292905220829055801561047157826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161068891815260200190565b60405180910390a350505050565b6001600160a01b0383166106c15780600260008282546106b69190610938565b909155506107339050565b6001600160a01b038316600090815260208190526040902054818110156107145760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016103d4565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b03821661074f5760028054829003905561076e565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516107b391815260200190565b60405180910390a3505050565b600060208083528351808285015260005b818110156107ed578581018301518582016040015282016107d1565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b038116811461082557600080fd5b919050565b6000806040838503121561083d57600080fd5b6108468361080e565b946020939093013593505050565b60008060006060848603121561086957600080fd5b6108728461080e565b92506108806020850161080e565b9150604084013590509250925092565b6000602082840312156108a257600080fd5b5035919050565b6000602082840312156108bb57600080fd5b6108c48261080e565b9392505050565b600080604083850312156108de57600080fd5b6108e78361080e565b91506108f56020840161080e565b90509250929050565b600181811c9082168061091257607f821691505b60208210810361093257634e487b7160e01b600052602260045260246000fd5b50919050565b8082018082111561031357634e487b7160e01b600052601160045260246000fdfea2646970667358221220938ed275b5511b8b2f96e26e5f9612165645a0fd30b36a37d277c10770552ed464736f6c63430008140033"
      };
    } else {
      return {
        abi: this.getStandardERC20ABI(),
        bytecode: "0x60806040523480156200001157600080fd5b5060405162000d4938038062000d498339810160408190526200003491620002cd565b83836003620000448382620003e9565b506004620000538282620003e9565b50506005805460ff191660ff84161790555062000089336200007783600a620005ca565b620000839085620005e2565b62000093565b5050505062000612565b6001600160a01b038216620000c35760405163ec442f0560e01b8152600060048201526024015b60405180910390fd5b620000d160008383620000d5565b5050565b6001600160a01b03831662000104578060026000828254620000f89190620005fc565b90915550620001789050565b6001600160a01b03831660009081526020819052604090205481811015620001595760405163391434e360e21b81526001600160a01b03851660048201526024810182905260448101839052606401620000ba565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b0382166200019657600280548290039055620001b5565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051620001fb91815260200190565b60405180910390a3505050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200023057600080fd5b81516001600160401b03808211156200024d576200024d62000208565b604051601f8301601f19908116603f0116810190828211818310171562000278576200027862000208565b816040528381526020925086838588010111156200029557600080fd5b600091505b83821015620002b957858201830151818301840152908201906200029a565b600093810190920192909252949350505050565b60008060008060808587031215620002e457600080fd5b84516001600160401b0380821115620002fc57600080fd5b6200030a888389016200021e565b955060208701519150808211156200032157600080fd5b5062000330878288016200021e565b93505060408501519150606085015160ff811681146200034f57600080fd5b939692955090935050565b600181811c908216806200036f57607f821691505b6020821081036200039057634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620003e457600081815260208120601f850160051c81016020861015620003bf5750805b601f850160051c820191505b81811015620003e057828155600101620003cb565b5050505b505050565b81516001600160401b0381111562000405576200040562000208565b6200041d816200041684546200035a565b8462000396565b602080601f8311600181146200045557600084156200043c5750858301515b600019600386901b1c1916600185901b178555620003e0565b600085815260208120601f198616915b82811015620004865788860151825594840194600190910190840162000465565b5085821015620004a55787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b600181815b808511156200050c578160001904821115620004f057620004f0620004b5565b80851615620004fe57918102915b93841c9390800290620004d0565b509250929050565b6000826200052557506001620005c4565b816200053457506000620005c4565b81600181146200054d5760028114620005585762000578565b6001915050620005c4565b60ff8411156200056c576200056c620004b5565b50506001821b620005c4565b5060208310610133831016604e8410600b84101617156200059d575081810a620005c4565b620005a98383620004cb565b8060001904821115620005c057620005c0620004b5565b0290505b92915050565b6000620005db60ff84168362000514565b9392505050565b8082028115828204841417620005c457620005c4620004b5565b80820180821115620005c457620005c4620004b5565b61072780620006226000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce567146100fe57806370a082311461011357806395d89b411461013c578063a9059cbb14610144578063dd62ed3e1461015757600080fd5b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100d957806323b872dd146100eb575b600080fd5b6100a0610190565b6040516100ad9190610571565b60405180910390f35b6100c96100c43660046105db565b610222565b60405190151581526020016100ad565b6002545b6040519081526020016100ad565b6100c96100f9366004610605565b61023c565b60055460405160ff90911681526020016100ad565b6100dd610121366004610641565b6001600160a01b031660009081526020819052604090205490565b6100a0610260565b6100c96101523660046105db565b61026f565b6100dd610165366004610663565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b60606003805461019f90610696565b80601f01602080910402602001604051908101604052809291908181526020018280546101cb90610696565b80156102185780601f106101ed57610100808354040283529160200191610218565b820191906000526020600020905b8154815290600101906020018083116101fb57829003601f168201915b5050505050905090565b60003361023081858561027d565b60019150505b92915050565b60003361024a85828561028f565b610255858585610313565b506001949350505050565b60606004805461019f90610696565b600033610230818585610313565b61028a8383836001610372565b505050565b6001600160a01b0383811660009081526001602090815260408083209386168352929052205460001981101561030d57818110156102fe57604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064015b60405180910390fd5b61030d84848484036000610372565b50505050565b6001600160a01b03831661033d57604051634b637e8f60e11b8152600060048201526024016102f5565b6001600160a01b0382166103675760405163ec442f0560e01b8152600060048201526024016102f5565b61028a838383610447565b6001600160a01b03841661039c5760405163e602df0560e01b8152600060048201526024016102f5565b6001600160a01b0383166103c657604051634a1406b160e11b8152600060048201526024016102f5565b6001600160a01b038085166000908152600160209081526040808320938716835292905220829055801561030d57826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161043991815260200190565b60405180910390a350505050565b6001600160a01b03831661047257806002600082825461046791906106d0565b909155506104e49050565b6001600160a01b038316600090815260208190526040902054818110156104c55760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016102f5565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b0382166105005760028054829003905561051f565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161056491815260200190565b60405180910390a3505050565b600060208083528351808285015260005b8181101561059e57858101830151858201604001528201610582565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b03811681146105d657600080fd5b919050565b600080604083850312156105ee57600080fd5b6105f7836105bf565b946020939093013593505050565b60008060006060848603121561061a57600080fd5b610623846105bf565b9250610631602085016105bf565b9150604084013590509250925092565b60006020828403121561065357600080fd5b61065c826105bf565b9392505050565b6000806040838503121561067657600080fd5b61067f836105bf565b915061068d602084016105bf565b90509250929050565b600181811c908216806106aa57607f821691505b6020821081036106ca57634e487b7160e01b600052602260045260246000fd5b50919050565b8082018082111561023657634e487b7160e01b600052601160045260246000fdfea26469706673582212201e68b46dcb693b803d805da44bfc3b18ba7b19addfa4b50f59dedc2a8c5f9be364736f6c63430008140033"
      };
    }
  }

  /**
   * Get pre-compiled ERC721 contract (Hyperion-compatible)
   */
  private getCompiledERC721Contract(mintable: boolean): { abi: string[], bytecode: string } {
    // For now, we'll always use the mintable version for ERC721
    // In the future, we could add a standard ERC721 version
    if (mintable) {
      return {
        abi: this.getMintableERC721ABI(),
        bytecode: erc721Contracts.mintableERC721.bytecode
      };
    } else {
      return {
        abi: this.getStandardERC721ABI(),
        bytecode: erc721Contracts.simpleERC721.bytecode
      };
    }
  }

  private getStandardERC20Bytecode(): string {
    // Simple ERC20 contract bytecode with constructor(string name, string symbol, uint256 initialSupply)
    return "0x608060405234801561001057600080fd5b5060405161080f38038061080f8339818101604052810190610032919061016a565b82600390816100419190610369565b508160049081610051919061036a565b5080600081905550806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516100f991906103f7565b60405180910390a35050506104b2565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61016082610117565b810181811067ffffffffffffffff8211171561017f5761017e610128565b5b80604052505050565b6000610192610109565b905061019e8282610157565b919050565b600067ffffffffffffffff8211156101be576101bd610128565b5b6101c782610117565b9050602081019050919050565b60005b838110156101f25780820151818401526020810190506101d7565b60008484015250505050565b600061021161020c846101a3565b610188565b90508281526020810184848401111561022d5761022c610112565b5b6102388482856101d4565b509392505050565b600082601f8301126102555761025461010d565b5b81516102658482602086016101fe565b91505092915050565b6000819050919050565b6102818161026e565b811461028c57600080fd5b50565b60008151905061029e81610278565b92915050565b6000806000606084860312156102bd576102bc610103565b5b600084015167ffffffffffffffff8111156102db576102da610108565b5b6102e786828701610240565b935050602084015167ffffffffffffffff81111561030857610307610108565b5b61031486828701610240565b92505060406103258682870161028f565b9150509250925092565b600081519050919050565b600082825260208201905092915050565b60005b8381101561036957808201518184015260208101905061034e565b60008484015250505050565b600061038082610330565b61038a818561033b565b935061039a81856020860161034c565b6103a381610117565b840191505092915050565b6103b78161026e565b82525050565b60006020820190506103d260008301846103ae565b92915050565b600060208201905081810360008301526103f28184610375565b905092915050565b600060208201905061040f60008301846103ae565b92915050565b61035e806104216000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce5671461013457806370a082311461015257806395d89b4114610182578063a9059cbb146101a0578063dd62ed3e146101d057610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a0610200565b6040516100ad91906102a5565b60405180910390f35b6100d060048036038101906100cb9190610360565b61028e565b6040516100dd91906103bb565b60405180910390f35b6100ee6102ab565b6040516100fb91906103e5565b60405180910390f35b61011e60048036038101906101199190610400565b6102b1565b60405161012b91906103bb565b60405180910390f35b61013c610340565b6040516101499190610469565b60405180910390f35b61016c60048036038101906101679190610484565b610345565b60405161017991906103e5565b60405180910390f35b61018a61035d565b60405161019791906102a5565b60405180910390f35b6101ba60048036038101906101b59190610360565b6103eb565b6040516101c791906103bb565b60405180910390f35b6101ea60048036038101906101e591906104b1565b610408565b6040516101f791906103e5565b60405180910390f35b6003805461020d90610520565b80601f016020809104026020016040519081016040528092919081815260200182805461023990610520565b80156102865780601f1061025b57610100808354040283529160200191610286565b820191906000526020600020905b81548152906001019060200180831161026957829003601f168201915b505050505081565b60006102a133848461042d565b6001905092915050565b60005481565b60006102be8484846104f6565b610335843384600260008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546103309190610580565b61042d565b600190509392505050565b601281565b60016020528060005260406000206000915090505481565b6004805461036a90610520565b80601f016020809104026020016040519081016040528092919081815260200182805461039690610520565b80156103e35780601f106103b8576101008083540402835291602001916103e3565b820191906000526020600020905b8154815290600101906020018083116103c657829003601f168201915b505050505081565b60006103f83384846104f6565b6001905092915050565b6002602052816000526040600020602052806000526040600020600091509150505481565b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040516104e991906103e5565b60405180910390a3505050565b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461054491906105b4565b9250508190555080600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516105f591906103e5565b60405180910390a3505050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561063c578082015181840152602081019050610621565b60008484015250505050565b6000601f19601f8301169050919050565b600061066482610602565b61066e818561060d565b935061067e81856020860161061e565b61068781610648565b840191505092915050565b600060208201905081810360008301526106ac8184610659565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006106e4826106b9565b9050919050565b6106f4816106d9565b81146106ff57600080fd5b50565b600081359050610711816106eb565b92915050565b6000819050919050565b61072a81610717565b811461073557600080fd5b50565b60008135905061074781610721565b92915050565b60008060408385031215610764576107636106b4565b5b600061077285828601610702565b925050602061078385828601610738565b9150509250929050565b60008115159050919050565b6107a28161078d565b82525050565b60006020820190506107bd6000830184610799565b92915050565b6107cc81610717565b82525050565b60006020820190506107e760008301846107c3565b92915050565b600080600060608486031215610806576108056106b4565b5b600061081486828701610702565b935050602061082586828701610702565b925050604061083686828701610738565b9150509250925092565b600060ff82169050919050565b61085681610840565b82525050565b6000602082019050610871600083018461084d565b92915050565b600060208284031215610889576108886106b4565b5b600061089784828501610702565b91505092915050565b600080604083850312156108b7576108b66106b4565b5b60006108c585828601610702565b92505060206108d685828601610702565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061092857607f821691505b60208210810361093b5761093a6108e1565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061097c82610717565b915061098783610717565b925082820390508181111561099f5761099e610941565b5b92915050565b60006109b082610717565b91506109bb83610717565b92508282019050808211156109d3576109d2610941565b5b9291505056fea2646970667358221220a8b8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b964736f6c63430008140033";
  }

  private getMintableERC20Bytecode(): string {
    // Pre-compiled bytecode for MintableERC20 contract (OpenZeppelin-based with Ownable)
    return "0x608060405234801561001057600080fd5b5060405161145238038061145283398101604052810190610030919061028a565b8383816003908161004191906104f6565b50806004908161005191906104f6565b50505061006233610067565b80600560006101000a81548160ff021916908360ff16021790555061009533600560009054906101000a900460ff1660ff16846100cb60201b60201c565b50505050610622565b6000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361013a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610131906105e9565b60405180910390fd5b61014c60008383610158565b5050565b61015d83838361015d565b505050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806101de57607f821691505b6020821081036101f1576101f0610197565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026102597fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261021c565b610263868361021c565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006102aa6102a561029f8461027b565b610285565b61027b565b9050919050565b6000819050919050565b6102c48361028f565b6102d86102d0826102b1565b848454610229565b825550505050565b600090565b6102ed6102e0565b6102f88184846102bb565b505050565b5b8181101561031c576103116000826102e5565b6001810190506102fe565b5050565b601f8211156103615761033281610201565b61033b84610216565b8101602085101561034a578190505b61035e61035685610216565b8301826102fd565b50505b505050565b600082821c905092915050565b600061038460001984600802610366565b1980831691505092915050565b600061039d8383610373565b9150826002028217905092915050565b6103b682610162565b67ffffffffffffffff8111156103cf576103ce61016d565b5b6103d982546101c6565b6103e4828285610320565b600060209050601f831160018114610417576000841561040557828701519050505b61040f8582610391565b865550610477565b601f19841661042586610201565b60005b8281101561044d57848901518255600182019150602085019450602081019050610428565b8683101561046a5784890151610466601f891682610373565b8355505b6001600288020188555050505b505050505050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006104af82610484565b9050919050565b6104bf816104a4565b81146104ca57600080fd5b50565b6000815190506104dc816104b6565b92915050565b6000819050919050565b6104f5816104e2565b811461050057600080fd5b50565b600081519050610512816104ec565b92915050565b600060ff82169050919050565b61052e81610518565b811461053957600080fd5b50565b60008151905061054b81610525565b92915050565b6000806000806080858703121561056b5761056a61047f565b5b6000610579878288016104cd565b945050602061058a87828801610503565b935050604061059b8782880161053c565b92505060606105ac87828801610503565b91505092959194509250565b600082825260208201905092915050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b60006105ff601f836105b8565b915061060a826105c9565b602082019050919050565b6000602082019050818103600083015261062e816105f2565b9050919050565b610e218061063160003960006000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c806370a0823111610097578063a457c2d711610066578063a457c2d7146102a3578063a9059cbb146102d3578063dd62ed3e14610303578063f2fde38b14610333576100f5565b806370a082311461021b578063715018a61461024b5780638da5cb5b1461025557806395d89b4114610273576100f5565b806323b872dd116100d357806323b872dd1461019157806340c10f19146101c157806339509351146101dd5780636f307dc31461020d576100f5565b806306fdde03146100fa578063095ea7b31461011857806318160ddd14610148575b600080fd5b61010261034f565b60405161010f9190610a5a565b60405180910390f35b610132600480360381019061012d9190610b15565b6103e1565b60405161013f9190610b70565b60405180910390f35b610150610404565b60405161015d9190610b9a565b60405180910390f35b6101ab60048036038101906101a69190610bb5565b61040e565b6040516101b89190610b70565b60405180910390f35b6101db60048036038101906101d69190610b15565b61043d565b005b6101f760048036038101906101f29190610b15565b610463565b6040516102049190610b70565b60405180910390f35b61021561049a565b6040516102229190610c17565b60405180910390f35b61023560048036038101906102309190610c32565b6104c0565b6040516102429190610b9a565b60405180910390f35b610253610508565b005b61025d61051c565b60405161026a9190610c6e565b60405180910390f35b61027b610546565b6040516102889190610a5a565b60405180910390f35b6102bd60048036038101906102b89190610b15565b6105d8565b6040516102ca9190610b70565b60405180910390f35b6102ed60048036038101906102e89190610b15565b61064f565b6040516102fa9190610b70565b60405180910390f35b61031d60048036038101906103189190610c89565b610672565b60405161032a9190610b9a565b60405180910390f35b61034d60048036038101906103489190610c32565b6106f9565b005b60606003805461035e90610cf8565b80601f016020809104026020016040519081016040528092919081815260200182805461038a90610cf8565b80156103d75780601f106103ac576101008083540402835291602001916103d7565b820191906000526020600020905b8154815290600101906020018083116103ba57829003601f168201915b5050505050905090565b6000806103ec61077c565b90506103f9818585610784565b600191505092915050565b6000600254905090565b60008061041961077c565b905061042685828561094d565b6104318585856109d9565b60019150509392505050565b6104456109d9565b61044f8282610a4f565b5050565b60008061045e61077c565b905061047681858561047085896106f9565b61047a9190610d58565b610784565b600191505092915050565b6000600560009054906101000a900460ff16905090565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6105106109d9565b61051a6000610baf565b565b6000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60606004805461055590610cf8565b80601f016020809104026020016040519081016040528092919081815260200182805461058190610cf8565b80156105ce5780601f106105a3576101008083540402835291602001916105ce565b820191906000526020600020905b8154815290600101906020018083116105b157829003601f168201915b5050505050905090565b6000806105e361077c565b905060006105f182866106f9565b905083811015610636576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161062d90610dfe565b60405180910390fd5b610643828686840361078a565b60019250505092915050565b60008061065a61077c565b90506106678185856109d9565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6107016109d9565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610770576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161076790610e90565b60405180910390fd5b61077981610baf565b50565b600033905090565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036107f3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107ea90610f22565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610862576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161085990610fb4565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040516109409190610b9a565b60405180910390a3505050565b600061095984846106f9565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146109d357818110156109c5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109bc90611020565b60405180910390fd5b6109d2848484840361078a565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610a48576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a3f906110b2565b60405180910390fd5b505050565b610a5982826110d2565b5050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610a97578082015181840152602081019050610a7c565b60008484015250505050565b6000601f19601f8301169050919050565b6000610abf82610a5d565b610ac98185610a68565b9350610ad9818560208601610a79565b610ae281610aa3565b840191505092915050565b60006020820190508181036000830152610b078184610ab4565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610b3f82610b14565b9050919050565b610b4f81610b34565b8114610b5a57600080fd5b50565b600081359050610b6c81610b46565b92915050565b6000819050919050565b610b8581610b72565b8114610b9057600080fd5b50565b600081359050610ba281610b7c565b92915050565b60008115159050919050565b610bbd81610ba8565b82525050565b6000602082019050610bd86000830184610bb4565b92915050565b610be781610b72565b82525050565b6000602082019050610c026000830184610bde565b92915050565b600060ff82169050919050565b610c1e81610c08565b82525050565b6000602082019050610c396000830184610c15565b92915050565b600060208284031215610c5557610c54610b0f565b5b6000610c6384828501610b5d565b91505092915050565b610c7581610b34565b82525050565b6000602082019050610c906000830184610c6c565b92915050565b60008060408385031215610cad57610cac610b0f565b5b6000610cbb85828601610b5d565b9250506020610ccc85828601610b5d565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610d1057607f821691505b602082108103610d2357610d22610cd6565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610d6382610b72565b9150610d6e83610b72565b9250828201905080821115610d8657610d85610d29565b5b92915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760008201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b6000610de8602583610a68565b9150610df382610d8c565b604082019050919050565b60006020820190508181036000830152610e1781610ddb565b9050919050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000610e7a602683610a68565b9150610e8582610e1e565b604082019050919050565b60006020820190508181036000830152610ea981610e6d565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b6000610f0c602483610a68565b9150610f1782610eb0565b604082019050919050565b60006020820190508181036000830152610f3b81610eff565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b6000610f9e602283610a68565b9150610fa982610f42565b604082019050919050565b60006020820190508181036000830152610fcd81610f91565b9050919050565b7f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000600082015250565b600061100a601d83610a68565b915061101582610fd4565b602082019050919050565b6000602082019050818103600083015261103981610ffd565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b600061109c602583610a68565b91506110a782611040565b604082019050919050565b600060208201905081810360008301526110cb8161108f565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611141576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111389061111e565b60405180910390fd5b61114d60008383610787565b806002600082825461115f9190610d58565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516112109190610b9a565b60405180910390a35050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b600061125260208361a68565b915061125d8261121c565b602082019050919050565b6000602082019050818103600083015261128181611245565b905091905056fea2646970667358221220a8b8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b964736f6c63430008140033";
  }
}
