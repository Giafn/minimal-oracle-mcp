import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js"

import oracledb from "oracledb"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, ".env") })

// Initialize Oracle Instant Client (thick mode)
await oracledb.initOracleClient({
  libDir: process.env.LD_LIBRARY_PATH
})

const server = new Server(
  {
    name: "oracle-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
  })
}

server.setRequestHandler(ListToolsRequestSchema, async () => {

  return {
    tools: [
      {
        name: "query",
        description: "Run SQL query (max 150 rows)",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string" }
          },
          required: ["sql"]
        }
      }
    ]
  }

})

server.setRequestHandler(CallToolRequestSchema, async (req) => {

  const { name, arguments: args } = req.params

  if (name !== "query") {
    throw new Error(`Unsupported tool: ${name}`)
  }

  const conn = await getConnection()

  try {

    const result = await conn.execute(
      `SELECT * FROM (${args.sql}) WHERE ROWNUM <= 150`
    )

    return {
      content: [{ type: "text", text: JSON.stringify(result.rows) }]
    }

  } finally {
    await conn.close()
  }

})

const transport = new StdioServerTransport()
await server.connect(transport)
