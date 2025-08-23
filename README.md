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

## Quick Start

### Installation

#### Option 1: NPM Package (Recommended)

```bash
# Install globally to use as CLI tool
npm install -g @kwaude/xmtp-mcp-server

# Or install locally in your project  
npm install @kwaude/xmtp-mcp-server
```

#### Option 2: From Source

```bash
git clone https://github.com/kwaude/xmtp-mcp.git
cd xmtp-mcp-server
npm install
npm run build
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your wallet private key:
```env
WALLET_KEY=0x...your_private_key_here
XMTP_ENV=production  # or 'dev' for testnet, 'local' for development
```

### Running the Server

```bash
# Production
npm run build && npm start

# Development with auto-reload
npm run dev
```

## Claude Code Integration

Add to your Claude Code MCP configuration:

### Command Line

#### Using Global Installation
```bash
claude mcp add xmtp xmtp-mcp-server --env WALLET_KEY=your_key_here --env XMTP_ENV=production
```

#### Using Local Installation  
```bash
claude mcp add xmtp node /path/to/node_modules/@kwaude/xmtp-mcp-server/dist/index.js --env WALLET_KEY=your_key_here --env XMTP_ENV=production
```

#### From Source
```bash
claude mcp add xmtp node /path/to/xmtp-mcp-server/dist/index.js --env WALLET_KEY=your_key_here --env XMTP_ENV=production
```

### Manual Configuration
```json
{
  "mcpServers": {
    "xmtp": {
      "command": "node",
      "args": ["/path/to/xmtp-mcp-server/dist/index.js"],
      "env": {
        "WALLET_KEY": "your_private_key_here",
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

### Project Structure
```
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration  
├── .env.example          # Environment template
└── README.md            # This file
```

### Building
```bash
npm run build
```

### Testing
```bash
# Test basic functionality
node test-signer.js

# Test MCP server directly
node test-mcp-direct.js

# Test all tools
node test-all-tools.js
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

## Known Issues

### canMessage API Bug

**Status**: 🐛 Active Issue

The XMTP Node SDK's `canMessage()` function currently returns `undefined` instead of proper boolean values, causing message sending to fail even with properly activated wallets.

**Impact**: 
- ✅ Wallet connection works
- ✅ Message retrieval works  
- ✅ Conversation listing works
- ❌ Message sending blocked by validation

**Workaround**: 
1. Activate wallets via [xmtp.chat](https://xmtp.chat) 
2. Use `.env.development` test wallets for development
3. Message retrieval and conversation management work normally

**Related**: This affects the XMTP Node SDK directly, not the MCP server implementation.

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