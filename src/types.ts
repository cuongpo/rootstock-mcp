/**
 * Type definitions for Rootstock MCP Server
 */

export interface RootstockConfig {
  rpcUrl: string;
  chainId?: number;
  networkName?: string;
  explorerUrl?: string;
  currencySymbol?: string;
}

export interface WalletInfo {
  address: string;
  privateKey?: string;
  mnemonic?: string;
  publicKey?: string;
  balance?: string;
}

export interface TransactionRequest {
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
}

export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  status?: 'pending' | 'confirmed' | 'failed';
}

export interface BlockInfo {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  gasLimit: string;
  gasUsed: string;
  miner: string;
  difficulty?: string;
  totalDifficulty?: string;
  size: number;
  transactionCount: number;
}

export interface NetworkInfo {
  chainId: number;
  networkName: string;
  blockNumber: number;
  gasPrice: string;
  isConnected: boolean;
}

export interface ContractCallRequest {
  contractAddress: string;
  methodName: string;
  parameters: any[];
  abi?: any[];
}

export interface ContractCallResponse {
  result: any;
  gasUsed?: string;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
}

export interface TokenBalance {
  tokenAddress: string;
  balance: string;
  decimals: number;
  symbol: string;
  name: string;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  estimatedCost: string;
}

export interface TransactionHistory {
  transactions: TransactionResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// MCP Tool parameter types
export interface CreateWalletParams {
  name?: string;
  mnemonic?: string;
}

export interface ImportWalletParams {
  privateKey?: string;
  mnemonic?: string;
  name?: string;
}

export interface GetBalanceParams {
  address: string;
  tokenAddress?: string;
}

export interface SendTransactionParams {
  to: string;
  amount: string;
  tokenAddress?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface GetTransactionParams {
  hash: string;
}

export interface GetTransactionHistoryParams {
  address: string;
  page?: number;
  pageSize?: number;
  tokenAddress?: string;
}

export interface GetBlockParams {
  blockNumber?: number;
  blockHash?: string;
}

export interface CallContractParams {
  contractAddress: string;
  methodName: string;
  parameters?: any[];
  abi?: any[];
}

export interface SendContractTransactionParams {
  contractAddress: string;
  methodName: string;
  parameters?: any[];
  abi?: any[];
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface EstimateGasParams {
  to: string;
  value?: string;
  data?: string;
}

// ERC20 Token Deployment Types
export interface DeployERC20Params {
  name: string;
  symbol: string;
  decimals?: number;
  initialSupply: string;
  mintable?: boolean;
  burnable?: boolean;
  gasLimit?: string;
  gasPrice?: string;
}

export interface ERC20DeploymentResponse {
  contractAddress: string;
  transactionHash: string;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  deployer: string;
  gasUsed?: string;
  blockNumber?: number;
}

export interface GetTokenInfoParams {
  tokenAddress: string;
}

export interface TokenInfoResponse {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner?: string;
  mintable?: boolean;
  burnable?: boolean;
}

export interface MintTokensParams {
  tokenAddress: string;
  to: string;
  amount: string;
  gasLimit?: string;
  gasPrice?: string;
}

// ERC721 NFT Deployment Types
export interface DeployERC721Params {
  name: string;
  symbol: string;
  mintable?: boolean;
  gasLimit?: string;
  gasPrice?: string;
}

export interface ERC721DeploymentResponse {
  contractAddress: string;
  transactionHash: string;
  name: string;
  symbol: string;
  deployer: string;
  gasUsed?: string;
  blockNumber?: number;
}

export interface GetNFTInfoParams {
  tokenAddress: string;
  tokenId?: string;
}

export interface NFTInfoResponse {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  tokenId?: string;
  tokenURI?: string;
  owner?: string;
}

export interface MintNFTParams {
  tokenAddress: string;
  to: string;
  tokenId: string;
  tokenURI: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransferNFTParams {
  tokenAddress: string;
  from: string;
  to: string;
  tokenId: string;
  gasLimit?: string;
  gasPrice?: string;
}
