#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client, type Dm, type Group, type DecodedMessage, type Identifier, type IdentifierKind } from "@xmtp/node-sdk";
import { generatePrivateKey, privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { toBytes } from "viem";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface XMTPServerState {
  client: Client | null;
  walletAddress: string | null;
}

class XMTPMCPServer {
  private server: Server;
  private state: XMTPServerState;

  constructor() {
    this.server = new Server(
      {
        name: "xmtp-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.state = {
      client: null,
      walletAddress: null,
    };

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "xmtp://conversations",
            name: "XMTP Conversations",
            description: "List all conversations in XMTP inbox",
            mimeType: "application/json",
          },
          {
            uri: "xmtp://inbox",
            name: "XMTP Inbox",
            description: "Access XMTP inbox messages",
            mimeType: "application/json",
          },
        ],
      };
    });

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (!this.state.client) {
        throw new Error("XMTP client not connected. Use connect_xmtp tool first.");
      }

      switch (uri) {
        case "xmtp://conversations":
          const conversations = await this.getConversations();
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(conversations, null, 2),
              },
            ],
          };

        case "xmtp://inbox":
          const inbox = await this.getInboxMessages();
          return {
            contents: [
              {
                uri,
                mimeType: "application/json", 
                text: JSON.stringify(inbox, null, 2),
              },
            ],
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "connect_xmtp",
            description: "Connect to XMTP network with wallet key",
            inputSchema: {
              type: "object",
              properties: {
                privateKey: {
                  type: "string",
                  description: "Wallet private key (optional, uses env WALLET_KEY if not provided)",
                },
                environment: {
                  type: "string",
                  description: "XMTP environment: local, dev, or production",
                  enum: ["local", "dev", "production"],
                  default: "production",
                },
              },
            },
          },
          {
            name: "send_message",
            description: "Send a message to an address via XMTP",
            inputSchema: {
              type: "object",
              properties: {
                recipient: {
                  type: "string",
                  description: "Wallet address or ENS name to send message to",
                },
                message: {
                  type: "string",
                  description: "Message content to send",
                },
              },
              required: ["recipient", "message"],
            },
          },
          {
            name: "get_messages",
            description: "Get messages from a conversation with an address",
            inputSchema: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "Wallet address to get conversation with",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of messages to retrieve",
                  default: 50,
                },
              },
              required: ["address"],
            },
          },
          {
            name: "list_conversations",
            description: "List all active XMTP conversations",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "check_can_message",
            description: "Check if an address can receive XMTP messages",
            inputSchema: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "Wallet address to check",
                },
              },
              required: ["address"],
            },
          },
          {
            name: "stream_messages",
            description: "Start streaming new messages from all conversations",
            inputSchema: {
              type: "object",
              properties: {
                callback: {
                  type: "string",
                  description: "Optional callback function name for message handling",
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "connect_xmtp":
            return await this.connectXMTP(args);

          case "send_message":
            return await this.sendMessage(args);

          case "get_messages":
            return await this.getMessages(args);

          case "list_conversations":
            return await this.listConversations();

          case "check_can_message":
            return await this.checkCanMessage(args);

          case "stream_messages":
            return await this.streamMessages(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  private async connectXMTP(args: any) {
    try {
      const privateKey = args.privateKey || process.env.WALLET_KEY;
      const environment = args.environment || process.env.XMTP_ENV || "production";

      if (!privateKey) {
        throw new Error("Private key required. Provide via parameter or WALLET_KEY env variable.");
      }

      // Create proper EOA signer for XMTP using viem account (exact same as working debug script)
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const signer = {
        type: "EOA" as const,
        signMessage: async (message: string) => {
          const signature = await account.signMessage({ message });
          return toBytes(signature);
        },
        getIdentifier: () => {
          return {
            identifier: account.address,
            identifierKind: 0, // IdentifierKind.Ethereum
          };
        },
        getChainId: () => BigInt(1), // Ethereum mainnet as bigint
      };

      // Initialize XMTP client with proper signer
      this.state.client = await Client.create(signer, {
        env: environment as "local" | "dev" | "production",
      });

      this.state.walletAddress = account.address;

      return {
        content: [
          {
            type: "text",
            text: `Successfully connected to XMTP ${environment} network with address: ${account.address}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`XMTP connection failed: ${error}`);
    }
  }

  private async sendMessage(args: any) {
    if (!this.state.client) {
      throw new Error("XMTP client not connected. Use connect_xmtp tool first.");
    }

    const { recipient, message } = args;

    try {
      // Create recipient identifier for XMTP operations
      const recipientIdentifier = {
        identifier: recipient,
        identifierKind: 0, // IdentifierKind.Ethereum
      };
      
      // Check if we can message this address (try both original and lowercase)
      const canMessage = await this.state.client.canMessage([recipientIdentifier]);
      const canMessageResult = canMessage.get(recipient) || canMessage.get(recipient.toLowerCase());
      if (!canMessageResult) {
        throw new Error(`Address ${recipient} is not on the XMTP network`);
      }

      // Create DM conversation with identifier
      const conversation = await this.state.client.conversations.newDmWithIdentifier(recipientIdentifier);
      
      // Send message
      await conversation.send(message);

      return {
        content: [
          {
            type: "text",
            text: `Message sent to ${recipient}: "${message}"`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  private async getMessages(args: any) {
    if (!this.state.client) {
      throw new Error("XMTP client not connected. Use connect_xmtp tool first.");
    }

    const { address, limit = 50 } = args;

    try {
      // Create conversation with proper identifier
      const addressIdentifier = {
        identifier: address,
        identifierKind: 0, // IdentifierKind.Ethereum
      };
      const conversation = await this.state.client.conversations.newDmWithIdentifier(addressIdentifier);
      const messages = await conversation.messages({ limit });

      const messageList = messages.map((msg: DecodedMessage<any>) => ({
        id: msg.id,
        sender: msg.senderInboxId,
        content: msg.content,
        timestamp: msg.sentAt?.toISOString(),
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(messageList, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get messages: ${error}`);
    }
  }

  private async listConversations() {
    if (!this.state.client) {
      throw new Error("XMTP client not connected. Use connect_xmtp tool first.");
    }

    try {
      const conversations = await this.state.client.conversations.list();
      
      const conversationList = conversations.map((conv) => {
        return {
          id: conv.id,
          createdAt: conv.createdAt?.toISOString(),
        }
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(conversationList, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list conversations: ${error}`);
    }
  }

  private async checkCanMessage(args: any) {
    if (!this.state.client) {
      throw new Error("XMTP client not connected. Use connect_xmtp tool first.");
    }

    const { address } = args;

    try {
      // Convert address to proper identifier format
      const identifier = {
        identifier: address,
        identifierKind: 0, // IdentifierKind.Ethereum
      };
      
      const canMessage = await this.state.client.canMessage([identifier]);
      
      return {
        content: [
          {
            type: "text",
            text: `Address ${address} can receive XMTP messages: ${canMessage.get(address)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to check messaging capability: ${error}`);
    }
  }

  private async streamMessages(args: any) {
    if (!this.state.client) {
      throw new Error("XMTP client not connected. Use connect_xmtp tool first.");
    }

    try {
      // Start streaming all messages
      const stream = await this.state.client.conversations.streamAllMessages();
      
      let messageCount = 0;
      const messages: any[] = [];

      // Collect first few messages for demonstration
      for await (const message of stream) {
        messages.push({
          id: message.id,
          sender: message.senderInboxId,
          content: message.content,
          timestamp: message.sentAt?.toISOString(),
          conversationId: message.conversationId,
        });
        
        messageCount++;
        if (messageCount >= 10) break; // Limit for demonstration
      }

      return {
        content: [
          {
            type: "text", 
            text: `Started streaming messages. Recent messages:\n${JSON.stringify(messages, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to stream messages: ${error}`);
    }
  }

  private async getConversations() {
    if (!this.state.client) return [];
    
    try {
      const conversations = await this.state.client.conversations.list();
      return conversations.map((conv) => {
        return {
          id: conv.id,
          createdAt: conv.createdAt?.toISOString(),
        }
      });
    } catch (error) {
      console.error("Error getting conversations:", error);
      return [];
    }
  }

  private async getInboxMessages() {
    if (!this.state.client) return [];
    
    try {
      const conversations = await this.state.client.conversations.list();
      const allMessages: any[] = [];

      for (const conv of conversations) {
        const messages = await conv.messages({ limit: 10 });
        messages.forEach((msg: DecodedMessage<any>) => {
          allMessages.push({
            id: msg.id,
            sender: msg.senderInboxId,
            content: msg.content,
            timestamp: msg.sentAt?.toISOString(),
            conversationId: msg.conversationId,
          });
        });
      }

      // Sort by timestamp (newest first)
      return allMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Error getting inbox messages:", error);
      return [];
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("XMTP MCP server running on stdio");
  }
}

async function main() {
  const server = new XMTPMCPServer();
  await server.run();
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});