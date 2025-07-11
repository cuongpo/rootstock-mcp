/**
 * Wallet Manager
 * Handles wallet creation, import, and management
 */

import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { WalletInfo } from './types.js';

export class WalletManager {
  private wallets: Map<string, ethers.Wallet | ethers.HDNodeWallet> = new Map();
  private currentWallet: string | null = null;

  constructor() {
    this.loadWalletsFromEnv();
  }

  /**
   * Load wallets from environment variables
   */
  private loadWalletsFromEnv(): void {
    const privateKeys = (process.env.ROOTSTOCK_PRIVATE_KEYS || process.env.HYPERION_PRIVATE_KEYS)?.split(',') || [];
    const addresses = (process.env.ROOTSTOCK_ADDRESSES || process.env.HYPERION_ADDRESSES)?.split(',') || [];
    const currentAddress = process.env.ROOTSTOCK_CURRENT_ADDRESS || process.env.HYPERION_CURRENT_ADDRESS;

    privateKeys.forEach((privateKey, index) => {
      if (privateKey.trim()) {
        try {
          const wallet = new ethers.Wallet(privateKey.trim());
          const address = addresses[index]?.trim() || wallet.address;
          this.wallets.set(address.toLowerCase(), wallet);
          
          if (!this.currentWallet || address.toLowerCase() === currentAddress?.toLowerCase()) {
            this.currentWallet = address.toLowerCase();
          }
        } catch (error) {
          console.warn(`Failed to load wallet ${index}: ${error}`);
        }
      }
    });
  }

  /**
   * Create a new wallet
   */
  createWallet(_name?: string): WalletInfo {
    try {
      // Generate a random mnemonic
      const mnemonic = bip39.generateMnemonic();
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      // Store the wallet
      this.wallets.set(wallet.address.toLowerCase(), wallet);
      
      // Set as current wallet if it's the first one
      if (!this.currentWallet) {
        this.currentWallet = wallet.address.toLowerCase();
      }

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic,
        publicKey: wallet.publicKey,
      };
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error}`);
    }
  }

  /**
   * Import wallet from private key or mnemonic
   */
  importWallet(privateKey?: string, mnemonic?: string, _name?: string): WalletInfo {
    try {
      let wallet: ethers.Wallet | ethers.HDNodeWallet;

      if (privateKey) {
        wallet = new ethers.Wallet(privateKey);
      } else if (mnemonic) {
        if (!bip39.validateMnemonic(mnemonic)) {
          throw new Error('Invalid mnemonic phrase');
        }
        wallet = ethers.Wallet.fromPhrase(mnemonic);
      } else {
        throw new Error('Either private key or mnemonic must be provided');
      }

      // Store the wallet
      this.wallets.set(wallet.address.toLowerCase(), wallet);
      
      // Set as current wallet if it's the first one
      if (!this.currentWallet) {
        this.currentWallet = wallet.address.toLowerCase();
      }

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic,
        publicKey: 'publicKey' in wallet ? (wallet as any).publicKey : undefined,
      };
    } catch (error) {
      throw new Error(`Failed to import wallet: ${error}`);
    }
  }

  /**
   * Get wallet by address
   */
  getWallet(address: string): ethers.Wallet | ethers.HDNodeWallet {
    const wallet = this.wallets.get(address.toLowerCase());
    if (!wallet) {
      throw new Error(`Wallet not found for address: ${address}`);
    }
    return wallet;
  }

  /**
   * Get current wallet
   */
  getCurrentWallet(): ethers.Wallet | ethers.HDNodeWallet {
    if (!this.currentWallet) {
      throw new Error('No current wallet set');
    }
    return this.getWallet(this.currentWallet);
  }

  /**
   * Set current wallet
   */
  setCurrentWallet(address: string): void {
    if (!this.wallets.has(address.toLowerCase())) {
      throw new Error(`Wallet not found for address: ${address}`);
    }
    this.currentWallet = address.toLowerCase();
  }

  /**
   * List all available wallets
   */
  listWallets(): WalletInfo[] {
    const walletList: WalletInfo[] = [];
    
    for (const [_address, wallet] of this.wallets) {
      walletList.push({
        address: wallet.address,
        publicKey: 'publicKey' in wallet ? (wallet as any).publicKey : undefined,
        // Don't expose private keys in list
      });
    }

    return walletList;
  }

  /**
   * Get wallet info with masked private key
   */
  getWalletInfo(address: string): WalletInfo {
    const wallet = this.getWallet(address);
    return {
      address: wallet.address,
      privateKey: this.maskPrivateKey(wallet.privateKey),
      publicKey: 'publicKey' in wallet ? (wallet as any).publicKey : undefined,
    };
  }

  /**
   * Get current wallet address
   */
  getCurrentAddress(): string {
    if (!this.currentWallet) {
      throw new Error('No current wallet set');
    }
    return this.wallets.get(this.currentWallet)!.address;
  }

  /**
   * Check if wallet exists
   */
  hasWallet(address: string): boolean {
    return this.wallets.has(address.toLowerCase());
  }

  /**
   * Remove wallet
   */
  removeWallet(address: string): void {
    const addressLower = address.toLowerCase();
    if (!this.wallets.has(addressLower)) {
      throw new Error(`Wallet not found for address: ${address}`);
    }
    
    this.wallets.delete(addressLower);
    
    // If this was the current wallet, set a new current wallet
    if (this.currentWallet === addressLower) {
      const remainingWallets = Array.from(this.wallets.keys());
      this.currentWallet = remainingWallets.length > 0 ? remainingWallets[0] : null;
    }
  }

  /**
   * Get wallet count
   */
  getWalletCount(): number {
    return this.wallets.size;
  }

  /**
   * Validate address format
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Validate private key format
   */
  static isValidPrivateKey(privateKey: string): boolean {
    try {
      new ethers.Wallet(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate mnemonic phrase
   */
  static isValidMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Mask private key for display
   */
  private maskPrivateKey(privateKey: string): string {
    if (privateKey.length < 10) return privateKey;
    return `${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)}`;
  }

  /**
   * Generate a random wallet name
   */
  private generateWalletName(): string {
    const adjectives = ['Swift', 'Bright', 'Noble', 'Wise', 'Bold', 'Quick', 'Strong', 'Smart'];
    const nouns = ['Wallet', 'Account', 'Vault', 'Keeper', 'Guardian', 'Holder', 'Signer'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    return `${adjective}${noun}${number}`;
  }
}
