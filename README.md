# XMTP MCP Server

A Model Context Protocol server that enables AI agents to interact with the XMTP decentralized messaging network.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![XMTP](https://img.shields.io/badge/XMTP-v4.0.3-purple.svg)](https://xmtp.org)
[![MCP](https://img.shields.io/badge/MCP-1.0.0-green.svg)](https://modelcontextprotocol.io)

## Features

- **🔐 Secure Connection**: Initialize XMTP client with wallet authentication
- **📨 Send Messages**: Send encrypted messages to any XMTP-enabled wallet address  
- **📬 Receive Messages**: Retrieve message history from conversations
- **💬 Conversation Management**: List and manage conversations
- **🔄 Real-time Streaming**: Stream new messages as they arrive
- **✅ Address Validation**: Check if addresses can receive XMTP messages

## Installation

### Option 1: NPM Package (Recommended)

The easiest way to use the XMTP MCP Server is via npm:

```bash
# Install globally to use as CLI tool
npm install -g @kwaude/xmtp-mcp-server

# Verify installation (shows server info)
which xmtp-mcp-server
```

**Alternative: Local Project Installation**
```bash
# Install as project dependency
npm install @kwaude/xmtp-mcp-server

# Use via npx
npx @kwaude/xmtp-mcp-server
```

### Option 2: From Source (Development)

For development or customization:

```bash
# Clone repository
git clone https://github.com/kwaude/xmtp-mcp.git
cd xmtp-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm start
```

## Configuration

### Environment Setup

1. **For npm installation**: Create a `.env` file in your working directory:
```bash
# Download example configuration
curl -o .env https://raw.githubusercontent.com/kwaude/xmtp-mcp/main/XMTPMCPServer/.env.example

# Or create manually
touch .env
```

2. **For source installation**: Copy the included template:
```bash
cp .env.example .env
```

3. **Configure your wallet**:
```env
# Required: Your wallet private key
WALLET_KEY=0x...your_private_key_here

# Required: XMTP network environment
XMTP_ENV=production  # options: production, dev, local

# Optional: Database encryption key (auto-generated if not set)
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

### Wallet Activation

**⚠️ Important**: Before using the MCP server, wallets must be activated on XMTP:

1. Visit [xmtp.chat](https://xmtp.chat) or use Coinbase Wallet
2. Import your wallet using the private key from your `.env` file
3. Send a test message to activate your XMTP identity
4. The wallet is now ready for use with the MCP server

**Development Wallets**: Use the pre-activated test wallets in `.env.development` for immediate testing.

## Claude Code Integration

### Quick Setup (Recommended)

After installing the npm package globally:

```bash
# Add XMTP MCP server to Claude Code
claude mcp add xmtp xmtp-mcp-server

# Verify it's working
claude mcp list
```

**Note**: Make sure you have a `.env` file in your current directory with your wallet configuration.

### Alternative Setup Methods

#### With Environment Variables
```bash
# Pass environment variables directly
claude mcp add xmtp xmtp-mcp-server \
  --env WALLET_KEY=0x...your_key_here \
  --env XMTP_ENV=production
```

#### Using Local npm Installation  
```bash
# If installed as project dependency
claude mcp add xmtp node ./node_modules/@kwaude/xmtp-mcp-server/dist/index.js
```

#### From Source Build
```bash
# If building from source
claude mcp add xmtp node /path/to/xmtp-mcp/dist/index.js
```

### Manual Configuration (claude.json)

```json
{
  "mcpServers": {
    "xmtp": {
      "command": "xmtp-mcp-server",
      "env": {
        "WALLET_KEY": "0x...your_private_key_here",
        "XMTP_ENV": "production"
      }
    }
  }
}
```

**Alternative with Node.js**:
```json
{
  "mcpServers": {
    "xmtp": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "WALLET_KEY": "0x...your_private_key_here", 
        "XMTP_ENV": "production"
      }
    }
  }
}
```

## API Reference

### Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `connect_xmtp` | Connect to XMTP network | `privateKey?`, `environment?` |
| `send_message` | Send message to address | `recipient`, `message` |
| `get_messages` | Get conversation messages | `address`, `limit?` |
| `list_conversations` | List all conversations | none |
| `check_can_message` | Check if address can receive messages | `address` |
| `stream_messages` | Stream new messages in real-time | `callback?` |

### Resources

| Resource | Description |
|----------|-------------|
| `xmtp://conversations` | JSON list of all conversations |
| `xmtp://inbox` | JSON list of recent inbox messages |

## Examples

### Basic Usage

```javascript
// Connect to XMTP
await connectXMTP({
  privateKey: "0x...",
  environment: "production"
});

// Send a message
await sendMessage({
  recipient: "0x742d35Cc6634C0532925a3b8D4b9f22692d06711",
  message: "Hello from XMTP MCP Server!"
});

// Check if address can receive messages
const canMessage = await checkCanMessage({
  address: "0x742d35Cc6634C0532925a3b8D4b9f22692d06711"
});
```

### Error Handling

The server includes comprehensive error handling:
- Connection failures
- Invalid addresses
- Network timeouts
- Malformed requests

## Development

### Development Setup

```bash
# Clone and setup
git clone https://github.com/kwaude/xmtp-mcp.git
cd xmtp-mcp

# Install dependencies
npm install

# Copy development environment
cp .env.development .env

# Start development server with auto-reload
npm run dev
```

### Build Process

```bash
# Clean previous builds
npm run clean

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Development Workflow

1. **Make changes** in `src/index.ts`
2. **Test locally** with `npm run dev`
3. **Build** with `npm run build`
4. **Test build** with `npm start`
5. **Update Claude MCP** if needed:
   ```bash
   claude mcp remove xmtp
   claude mcp add xmtp node ./dist/index.js
   ```

### Project Structure
```
xmtp-mcp/
├── src/
│   └── index.ts              # Main MCP server implementation
├── dist/                     # Compiled JavaScript output
│   ├── index.js              # Main entry point
│   ├── index.d.ts            # TypeScript declarations
│   └── *.map                 # Source maps
├── package.json              # Package configuration & scripts
├── tsconfig.json             # TypeScript compiler config
├── .env.example              # Environment template
├── .env.development          # Pre-configured test wallets
├── .npmignore                # NPM publish exclusions
├── LICENSE                   # MIT license
└── README.md                 # Documentation
```

### Build Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `build` | Compile TypeScript | `tsc` |
| `dev` | Development server | `tsx --env-file .env src/index.ts` |
| `start` | Production server | `node dist/index.js` |
| `clean` | Remove build artifacts | `rm -rf dist` |
| `lint` | Code quality check | `eslint src --ext .ts` |
| `format` | Code formatting | `prettier --write src/**/*.ts` |

### Testing Locally

```bash
# Test the built package
npm pack
npm install -g ./kwaude-xmtp-mcp-server-*.tgz

# Test CLI command (shows server info)
which xmtp-mcp-server

# Test with Claude Code
claude mcp add test-xmtp xmtp-mcp-server
claude mcp list
```

### Publishing Updates

```bash
# Update version in package.json
npm version patch  # or minor, major

# Build and publish
npm run build
npm publish

# Push to GitHub
git push --follow-tags
```

## Security

- ✅ Private keys stored in environment variables only
- ✅ End-to-end encrypted messages via XMTP protocol
- ✅ No sensitive data logged or persisted locally
- ✅ Proper input validation and sanitization

## Requirements

- **Node.js**: 20+
- **XMTP Network**: Active internet connection
- **Wallet**: Private key for XMTP-compatible wallet

## Network Support

| Environment | Description | URL |
|-------------|-------------|-----|
| `production` | XMTP Mainnet | `grpc.production.xmtp.network:443` |
| `dev` | XMTP Testnet | `grpc.dev.xmtp.network:443` |
| `local` | Local Development | `localhost:5556` |

## Network Configuration

### Default Environment
- **Important**: XMTP client defaults to `dev` network environment
- Use `environment` parameter in `connect_xmtp` to specify network:
  - Production network: `environment: "production"`  
  - Development network: `environment: "dev"` (default)

### Wallet Activation
**Critical**: Fresh wallets must be activated on the XMTP network before they can send messages:

1. **Network-Specific Activation**: Wallets can connect to any network but need separate activation per network
2. **Activation Process**:
   - Connect to [xmtp.chat](https://xmtp.chat) with your wallet
   - Send a message on the desired network (dev or production)
   - This establishes your XMTP identity on that specific network

**Testing**: Use pre-activated wallets from `.env.development` for immediate development.

## Known Issues

### canMessage API & Wallet Activation

**Status**: 🐛 Active Issue - Resolved ✅

**Root Cause**: Wallets need proper activation on each XMTP network.

**Investigation Results**:
- ✅ **Default Network**: Confirmed XMTP defaults to `dev` network  
- ✅ **Signer Interface**: Fixed `getChainId()` to return `bigint` instead of `number`
- ✅ **Case Sensitivity**: Implemented fallback for address case variations
- ⚠️  **Wallet Activation**: Test wallets require activation via xmtp.chat

**Fixed Issues**:
- Connection interface properly implemented
- Case sensitivity handling in canMessage checks
- Network environment configuration corrected

**Remaining Action**: Activate test wallets on desired network via [xmtp.chat](https://xmtp.chat)

## Troubleshooting

### Installation Issues

#### Package not found on npm
```bash
# Check if package is available
npm view @kwaude/xmtp-mcp-server

# If not available, install from GitHub
npm install -g https://github.com/kwaude/xmtp-mcp.git#main
```

#### Permission errors during global install
```bash
# Use npm prefix to install to user directory
npm install -g @kwaude/xmtp-mcp-server --prefix ~/.npm-global

# Or use npx without global install
npx @kwaude/xmtp-mcp-server
```

#### Command not found after global install
```bash
# Check installation path
npm list -g @kwaude/xmtp-mcp-server

# Check PATH includes npm global bin
echo $PATH | grep npm

# Add to PATH if missing (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$(npm config get prefix)/bin"

# Verify command is available
which xmtp-mcp-server
```

#### CLI shows server output instead of version
This is expected behavior. The `xmtp-mcp-server` command starts the MCP server immediately and communicates via stdio. Use `which xmtp-mcp-server` or `npm list -g @kwaude/xmtp-mcp-server` to verify installation.

### Configuration Issues

#### Environment file not found
```bash
# Create .env file in current directory
touch .env

# Download example configuration
curl -o .env https://raw.githubusercontent.com/kwaude/xmtp-mcp/main/XMTPMCPServer/.env.example
```

#### Invalid private key format
```bash
# Ensure private key starts with 0x
WALLET_KEY=0x1234567890abcdef...

# Check key length (should be 66 characters including 0x)
echo ${#WALLET_KEY}  # Should output: 66
```

### Connection Issues  

#### XMTP connection failed
```bash
# Check network environment
XMTP_ENV=production  # Try: dev, production, local

# Verify wallet key is valid
node -e "console.log(require('ethers').Wallet.fromPrivateKey('$WALLET_KEY').address)"
```

#### Address not on XMTP network
1. **Activate wallet** via [xmtp.chat](https://xmtp.chat)
2. **Send test message** to establish XMTP identity  
3. **Use development wallets** from `.env.development` for testing

#### MCP server not connecting to Claude
```bash
# Check MCP server status
claude mcp list

# Restart MCP server
claude mcp remove xmtp
claude mcp add xmtp xmtp-mcp-server

# Check logs for errors
claude mcp logs xmtp
```

### Development Issues

#### TypeScript compilation errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### Module not found errors
```bash
# Verify all dependencies are installed
npm install

# Check Node.js version (requires 20+)
node --version

# Clear npm cache if needed
npm cache clean --force
```

### Getting Help

1. **Check existing issues**: [GitHub Issues](https://github.com/kwaude/xmtp-mcp/issues)
2. **Create new issue**: Provide error logs and environment details
3. **Discord support**: Join [XMTP Discord](https://discord.gg/xmtp) for community help

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [XMTP Documentation](https://docs.xmtp.org/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Code](https://claude.ai/code)