import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as Figma from 'figma-api';
import {z} from 'zod'

function getFigmaClient() {
    const token = process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
    if (!token) {
        throw new Error("FIGMA_PERSONAL_ACCESS_TOKEN is not set");
    }
    return new Figma.Api({
        personalAccessToken: token
    })
}

// 创建 MCP 服务器
const server = new McpServer({
  name: "figma",
  version: "1.0.0"
});

// 获取 Figma 账户信息
server.tool("get_figma_account","get figma account info",
    {},
    async () => {
        const client = getFigmaClient();
        const account = await client.getUserMe()
        return {
            content: [{ type: "text", text: JSON.stringify(account) }]
        }
    }
);

// 获取 Figma 文件信息
server.tool("get_figma_file","get figma file info",
    {
        fileKey: z.string().describe("Figma文件的唯一标识符"),
        version: z.string().optional().describe("特定版本的ID，不提供则获取最新版本"),
        depth: z.number().min(1).max(4).default(2).describe("遍历节点树的最大深度，1-4之间的值"),
    },
    async ({fileKey, version, depth}) => {
        const client = getFigmaClient();
        const file = await client.getFile(fileKey)
        return {
            content: [{ type: "text", text: JSON.stringify(file) }]
        }
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);