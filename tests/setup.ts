/**
 * Jest setup file for Rootstock MCP Server tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.ROOTSTOCK_RPC_URL = 'https://public-node.testnet.rsk.co';
process.env.ROOTSTOCK_CHAIN_ID = '31';
process.env.ROOTSTOCK_NETWORK_NAME = 'Rootstock Testnet';
process.env.ROOTSTOCK_CURRENCY_SYMBOL = 'tRBTC';
process.env.ROOTSTOCK_EXPLORER_URL = 'https://explorer.testnet.rootstock.io';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.error and console.warn during tests unless explicitly needed
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(10000);
