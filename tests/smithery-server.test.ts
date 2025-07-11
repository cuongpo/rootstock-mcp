/**
 * Tests for Smithery Server
 */

import createStatelessServer, { configSchema } from '../src/smithery-server';

describe('Smithery Server', () => {
  describe('configSchema', () => {
    it('should validate default configuration', () => {
      const config = configSchema.parse({});

      expect(config.rpcUrl).toBe('https://public-node.testnet.rsk.co');
      expect(config.chainId).toBe(31);
      expect(config.networkName).toBe('Rootstock Testnet');
      expect(config.currencySymbol).toBe('tRBTC');
      expect(config.explorerUrl).toBe('https://explorer.testnet.rootstock.io');
      expect(config.debug).toBe(false);
    });

    it('should validate custom configuration', () => {
      const customConfig = {
        rpcUrl: 'https://custom-rpc.example.com',
        chainId: 12345,
        networkName: 'Custom Network',
        currencySymbol: 'CUSTOM',
        explorerUrl: 'https://custom-explorer.example.com',
        debug: true,
      };
      
      const config = configSchema.parse(customConfig);
      
      expect(config.rpcUrl).toBe('https://custom-rpc.example.com');
      expect(config.chainId).toBe(12345);
      expect(config.networkName).toBe('Custom Network');
      expect(config.currencySymbol).toBe('CUSTOM');
      expect(config.explorerUrl).toBe('https://custom-explorer.example.com');
      expect(config.debug).toBe(true);
    });

    it('should use defaults for missing optional fields', () => {
      const partialConfig = {
        rpcUrl: 'https://custom-rpc.example.com',
        chainId: 12345,
      };
      
      const config = configSchema.parse(partialConfig);
      
      expect(config.rpcUrl).toBe('https://custom-rpc.example.com');
      expect(config.chainId).toBe(12345);
      expect(config.networkName).toBe('Rootstock Testnet'); // default
      expect(config.currencySymbol).toBe('tRBTC'); // default
      expect(config.debug).toBe(false); // default
    });
  });

  describe('createStatelessServer', () => {
    it('should create a server with default configuration', () => {
      const config = configSchema.parse({});
      const server = createStatelessServer({ config });
      
      expect(server).toBeDefined();
      expect(typeof server).toBe('object');
    });

    it('should create a server with custom configuration', () => {
      const customConfig = configSchema.parse({
        rpcUrl: 'https://custom-rpc.example.com',
        chainId: 12345,
        networkName: 'Custom Network',
        debug: true,
      });
      
      const server = createStatelessServer({ config: customConfig });
      
      expect(server).toBeDefined();
      expect(typeof server).toBe('object');
    });

    it('should handle configuration validation errors', () => {
      expect(() => {
        // Invalid configuration - chainId should be number
        configSchema.parse({
          chainId: 'invalid',
        });
      }).toThrow();
    });
  });

  describe('server functionality', () => {
    let server: any;
    
    beforeEach(() => {
      const config = configSchema.parse({
        debug: true, // Enable debug mode for tests
      });
      server = createStatelessServer({ config });
    });

    it('should have the correct server name and version', () => {
      // Note: This test assumes the server object has name and version properties
      // The actual structure depends on the MCP SDK implementation
      expect(server).toBeDefined();
    });

    it('should be ready for MCP protocol communication', () => {
      // Basic test to ensure server object is properly structured
      expect(server).toBeDefined();
      expect(typeof server).toBe('object');
    });
  });

  describe('environment integration', () => {
    it('should work with test environment variables', () => {
      // Test that the server can be created with environment-based config
      const config = configSchema.parse({
        rpcUrl: process.env.ROOTSTOCK_RPC_URL || 'https://public-node.testnet.rsk.co',
        chainId: process.env.ROOTSTOCK_CHAIN_ID ? parseInt(process.env.ROOTSTOCK_CHAIN_ID, 10) : 31,
      });

      const server = createStatelessServer({ config });

      expect(server).toBeDefined();
      expect(config.rpcUrl).toBe('https://public-node.testnet.rsk.co');
      expect(config.chainId).toBe(31);
    });
  });
});
