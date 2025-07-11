# 🚀 Publishing Hyperion MCP Server to Smithery

This guide walks you through publishing the Hyperion MCP Server to [Smithery.ai](https://smithery.ai/), the marketplace for MCP servers.

## 📋 Prerequisites

Before publishing to Smithery, ensure you have:

- ✅ **GitHub Repository**: Your code must be in a public GitHub repository
- ✅ **Working MCP Server**: The server builds and runs successfully
- ✅ **Smithery Configuration**: `smithery.yaml` file is properly configured
- ✅ **Documentation**: README.md and other docs are complete
- ✅ **Testing**: Server has been tested and works correctly

## 🔧 Step 1: Prepare Your GitHub Repository

### 1.1 Create GitHub Repository

If you haven't already, create a public GitHub repository:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Hyperion MCP Server"

# Add remote origin (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/hyperion-mcp-server.git

# Push to GitHub
git push -u origin main
```

### 1.2 Update Repository URLs

Update the repository URLs in `smithery.yaml`:

```yaml
homepage: https://github.com/YOUR_USERNAME/hyperion-mcp-server
repository: https://github.com/YOUR_USERNAME/hyperion-mcp-server
```

And in `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/hyperion-mcp-server.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/hyperion-mcp-server/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/hyperion-mcp-server#readme"
}
```

## 🏷️ Step 2: Verify Smithery Configuration

Our `smithery.yaml` is already configured for Hyperion testnet:

```yaml
name: hyperion-mcp
displayName: Hyperion Blockchain MCP Server
description: Model Context Protocol server for Hyperion blockchain (testnet) interactions - wallet management, tMETIS transactions, and smart contract interactions on Chain ID 133717
version: 1.0.0
author: Hyperion MCP Team
license: MIT

categories:
  - blockchain
  - cryptocurrency
  - wallet
  - defi

keywords:
  - hyperion
  - hyperion-testnet
  - blockchain
  - cryptocurrency
  - wallet
  - tmetis
  - smart-contracts
  - defi
  - mcp
  - model-context-protocol
  - chain-133717

runtime:
  node: ">=18.0.0"

environment:
  required:
    - HYPERION_RPC_URL
  optional:
    - HYPERION_CHAIN_ID
    - HYPERION_NETWORK_NAME
    - HYPERION_CURRENCY_SYMBOL
    - HYPERION_EXPLORER_URL
```

## 🌐 Step 3: Submit to Smithery

### 3.1 Visit Smithery Website

1. Go to [https://smithery.ai/](https://smithery.ai/)
2. Look for "Submit Server" or "Add Server" button
3. Click to start the submission process

### 3.2 Provide Repository Information

You'll need to provide:

- **GitHub Repository URL**: `https://github.com/YOUR_USERNAME/hyperion-mcp-server`
- **Server Name**: `hyperion-mcp`
- **Description**: Brief description of the server
- **Categories**: Select blockchain, cryptocurrency, wallet, defi

### 3.3 Smithery Validation Process

Smithery will automatically:

1. **Clone your repository**
2. **Validate `smithery.yaml`** configuration
3. **Check for required files** (README.md, package.json, etc.)
4. **Verify the server builds** successfully
5. **Test basic functionality**

## 📝 Step 4: Optimize for Smithery

### 4.1 Ensure Quality Documentation

Make sure your repository has:

- ✅ **Clear README.md** with setup instructions
- ✅ **API documentation** in `docs/` folder
- ✅ **Example usage** in `examples/` folder
- ✅ **Troubleshooting guide**
- ✅ **License file** (MIT)

### 4.2 Add Smithery Badge

Once published, add the Smithery badge to your README:

```markdown
[![Smithery](https://smithery.ai/badge/hyperion-mcp)](https://smithery.ai/server/hyperion-mcp)
```

### 4.3 Version Management

For future updates:

1. Update version in `smithery.yaml` and `package.json`
2. Create a git tag: `git tag v1.0.1`
3. Push changes and tags: `git push && git push --tags`
4. Smithery will automatically detect and update

## 🔍 Step 5: Alternative Submission Methods

### 5.1 GitHub Integration

If Smithery supports GitHub integration:

1. Connect your GitHub account to Smithery
2. Select the repository from your account
3. Smithery will automatically detect the `smithery.yaml`

### 5.2 Manual Submission Form

If using a manual form, provide:

```
Server Name: hyperion-mcp
Display Name: Hyperion Blockchain MCP Server
Description: Model Context Protocol server for Hyperion blockchain (testnet) interactions - wallet management, tMETIS transactions, and smart contract interactions on Chain ID 133717
Repository URL: https://github.com/YOUR_USERNAME/hyperion-mcp-server
Categories: blockchain, cryptocurrency, wallet, defi
Keywords: hyperion, hyperion-testnet, blockchain, cryptocurrency, wallet, tmetis, smart-contracts, defi, mcp, model-context-protocol, chain-133717
```

## 📊 Step 6: Post-Publication

### 6.1 Monitor Your Listing

After publication:

1. **Check your server page** on Smithery
2. **Verify installation instructions** are correct
3. **Monitor download/usage statistics**
4. **Respond to user feedback** and issues

### 6.2 Promote Your Server

- **Share on social media** with #MCP #Hyperion #Blockchain hashtags
- **Write blog posts** about your server
- **Engage with the MCP community**
- **Update documentation** based on user feedback

### 6.3 Maintain Your Server

- **Regular updates** for bug fixes and new features
- **Keep dependencies updated** for security
- **Monitor GitHub issues** and respond promptly
- **Update documentation** as needed

## 🎯 Example Smithery Listing

Your server will appear on Smithery like this:

```
🔗 Hyperion Blockchain MCP Server
Model Context Protocol server for Hyperion blockchain (testnet) interactions

Categories: blockchain, cryptocurrency, wallet, defi
Author: Hyperion MCP Team
Version: 1.0.0
License: MIT

⭐ Features:
• Wallet management (create, import, list)
• tMETIS balance queries
• Transaction operations
• Smart contract interactions
• Hyperion testnet support (Chain ID: 133717)

📦 Installation:
npm install hyperion-mcp-server

🔧 Configuration:
HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link
HYPERION_CHAIN_ID=133717
HYPERION_CURRENCY_SYMBOL=tMETIS
```

## 🆘 Troubleshooting

### Common Issues:

1. **Repository not found**: Ensure repository is public
2. **Build fails**: Test `npm install && npm run build` locally
3. **Missing smithery.yaml**: File must be in repository root
4. **Invalid configuration**: Validate YAML syntax
5. **Missing documentation**: Ensure README.md exists and is comprehensive

### Getting Help:

- **Smithery Documentation**: Check Smithery's official docs
- **GitHub Issues**: Create issues in your repository
- **MCP Community**: Join MCP Discord/forums for support

## 🎉 Success!

Once published, your Hyperion MCP Server will be available to the entire MCP community! Users can:

- **Discover** your server on Smithery
- **Install** it with simple commands
- **Use** it with Claude Desktop and other MCP clients
- **Contribute** to your project on GitHub

**Your server will help bring blockchain functionality to AI applications worldwide! 🌍**
