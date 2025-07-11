/**
 * Tests for WalletManager
 */

import { WalletManager } from '../src/wallet-manager';

describe('WalletManager', () => {
  let walletManager: WalletManager;

  beforeEach(() => {
    walletManager = new WalletManager();
  });

  describe('createWallet', () => {
    it('should create a new wallet with mnemonic', () => {
      const wallet = walletManager.createWallet('TestWallet');
      
      expect(wallet.address).toBeDefined();
      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.mnemonic).toBeDefined();
      expect(wallet.privateKey).toBeDefined();
      expect(wallet.publicKey).toBeDefined();
    });

    it('should create wallet without name parameter', () => {
      const wallet = walletManager.createWallet();
      
      expect(wallet.address).toBeDefined();
      expect(wallet.mnemonic).toBeDefined();
    });

    it('should set first wallet as current wallet', () => {
      const wallet = walletManager.createWallet();
      const currentAddress = walletManager.getCurrentAddress();
      
      expect(currentAddress).toBe(wallet.address);
    });
  });

  describe('importWallet', () => {
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const expectedAddress = '0x9858EfFD232B4033E47d90003D41EC34EcaEda94';

    it('should import wallet from mnemonic', () => {
      const wallet = walletManager.importWallet(undefined, testMnemonic);
      
      expect(wallet.address).toBe(expectedAddress);
      expect(wallet.mnemonic).toBe(testMnemonic);
    });

    it('should import wallet from private key', () => {
      const privateKey = '0x3cf90f4acdaee72ab90c0da7eda158ec1e908a5698aaf11a99070bba5da18b17';
      const expectedAddr = '0x0E17561FEd60D7966Ab9d22A32D7B01dB9F02818';

      const wallet = walletManager.importWallet(privateKey);

      expect(wallet.address).toBe(expectedAddr);
      expect(wallet.privateKey).toBe(privateKey);
    });

    it('should throw error if neither private key nor mnemonic provided', () => {
      expect(() => {
        walletManager.importWallet();
      }).toThrow('Either private key or mnemonic must be provided');
    });

    it('should throw error for invalid mnemonic', () => {
      expect(() => {
        walletManager.importWallet(undefined, 'invalid mnemonic phrase');
      }).toThrow('Invalid mnemonic phrase');
    });
  });

  describe('wallet management', () => {
    beforeEach(() => {
      // Create a test wallet
      walletManager.createWallet('TestWallet');
    });

    it('should list wallets', () => {
      const wallets = walletManager.listWallets();
      
      expect(wallets).toHaveLength(1);
      expect(wallets[0].address).toBeDefined();
    });

    it('should get wallet count', () => {
      expect(walletManager.getWalletCount()).toBe(1);
      
      walletManager.createWallet('SecondWallet');
      expect(walletManager.getWalletCount()).toBe(2);
    });

    it('should check if wallet exists', () => {
      const wallet = walletManager.createWallet();
      
      expect(walletManager.hasWallet(wallet.address)).toBe(true);
      expect(walletManager.hasWallet('0x1234567890123456789012345678901234567890')).toBe(false);
    });

    it('should get current wallet', () => {
      const currentWallet = walletManager.getCurrentWallet();
      
      expect(currentWallet).toBeDefined();
      expect(currentWallet.address).toBeDefined();
    });
  });

  describe('static validation methods', () => {
    it('should validate addresses', () => {
      // Use a known valid Ethereum address (all lowercase)
      expect(WalletManager.isValidAddress('0x742d35cc6634c0532925a3b8d4c9db96590c6c87')).toBe(true);
      expect(WalletManager.isValidAddress('0x742d35Cc6634C0532925a3b8D4C9db96590c6C8')).toBe(false);
      expect(WalletManager.isValidAddress('invalid')).toBe(false);
    });

    it('should validate private keys', () => {
      const validKey = '0x3cf90f4acdaee72ab90c0da7eda158ec1e908a5698aaf11a99070bba5da18b17';
      const invalidKey = '0x123';

      expect(WalletManager.isValidPrivateKey(validKey)).toBe(true);
      expect(WalletManager.isValidPrivateKey(invalidKey)).toBe(false);
    });

    it('should validate mnemonic phrases', () => {
      const validMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const invalidMnemonic = 'invalid mnemonic phrase';
      
      expect(WalletManager.isValidMnemonic(validMnemonic)).toBe(true);
      expect(WalletManager.isValidMnemonic(invalidMnemonic)).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw error when getting current wallet with no wallets', () => {
      expect(() => {
        walletManager.getCurrentWallet();
      }).toThrow('No current wallet set');
    });

    it('should throw error when getting non-existent wallet', () => {
      expect(() => {
        walletManager.getWallet('0x1234567890123456789012345678901234567890');
      }).toThrow('Wallet not found for address');
    });
  });
});
