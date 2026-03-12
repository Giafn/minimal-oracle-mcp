import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js"

import oracledb from "oracledb"
import dotenv from "dotenv"

dotenv.config()

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
        name: "list_tables",
        description: "List tables in Oracle schema",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "list_views",
        description: "List views in Oracle schema",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Optional view name filter (supports % wildcard)" }
          }
        }
      },
      {
        name: "describe_table",
        description: "Describe table/view columns",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" }
          },
          required: ["table"]
        }
      },
      {
        name: "get_view_source",
        description: "Get the source code (SQL definition) of a view",
        inputSchema: {
          type: "object",
          properties: {
            view: { type: "string" }
          },
          required: ["view"]
        }
      },
      {
        name: "query",
        description: "Run SQL query (max 50 rows)",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string" }
          },
          required: ["sql"]
        }
      },
      {
        name: "list_procedures",
        description: "List stored procedures in Oracle schema",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Optional procedure name filter (supports % wildcard)" }
          }
        }
      },
      {
        name: "list_functions",
        description: "List functions in Oracle schema",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Optional function name filter (supports % wildcard)" }
          }
        }
      },
      {
        name: "list_packages",
        description: "List packages in Oracle schema",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Optional package name filter (supports % wildcard)" }
          }
        }
      },
      {
        name: "get_procedure_source",
        description: "Get the source code of a stored procedure",
        inputSchema: {
          type: "object",
          properties: {
            procedure: { type: "string" }
          },
          required: ["procedure"]
        }
      },
      {
        name: "get_function_source",
        description: "Get the source code of a function",
        inputSchema: {
          type: "object",
          properties: {
            function: { type: "string" }
          },
          required: ["function"]
        }
      },
      {
        name: "get_package_source",
        description: "Get the source code of a package (spec and body)",
        inputSchema: {
          type: "object",
          properties: {
            package: { type: "string" }
          },
          required: ["package"]
        }
      }
    ]
  }

})

server.setRequestHandler(CallToolRequestSchema, async (req) => {

  const { name, arguments: args } = req.params
  const conn = await getConnection()

  try {

    if (name === "list_tables") {

      const result = await conn.execute(`
        SELECT table_name FROM user_tables
      `)

      return {
        content: [{ type: "text", text: JSON.stringify(result.rows) }]
      }

    }

    if (name === "list_views") {

      const viewName = args?.name ? args.name.toUpperCase() : '%'

      const result = await conn.execute(
        `SELECT view_name FROM user_views WHERE view_name LIKE :viewName ORDER BY view_name`,
        [viewName]
      )

      return {
        content: [{ type: "text", text: JSON.stringify(result.rows) }]
      }

    }

    if (name === "describe_table") {

      const result = await conn.execute(
        `SELECT column_name, data_type, data_length, nullable
         FROM user_tab_columns
         WHERE table_name = :table
         ORDER BY column_id`,
        [args.table.toUpperCase()]
      )

      return {
        content: [{ type: "text", text: JSON.stringify(result.rows) }]
      }

    }

    if (name === "get_view_source") {

      const result = await conn.execute(
        `SELECT text FROM user_views WHERE view_name = :view`,
        [args.view.toUpperCase()]
      )

      if (result.rows.length === 0) {
        return {
          content: [{ type: "text", text: `View "${args.view}" not found` }]
        }
      }

      const source = result.rows[0][0]

      return {
        content: [{ type: "text", text: source }]
      }

    }

    if (name === "query") {

      const result = await conn.execute(
        `SELECT * FROM (${args.sql}) WHERE ROWNUM <= 50`
      )

      return {
        content: [{ type: "text", text: JSON.stringify(result.rows) }]
      }

    }

    if (name === "list_procedures") {

      const procName = args?.name ? args.name.toUpperCase() : '%'

      const result = await conn.execute(
        `SELECT object_name FROM user_procedures
         WHERE object_type = 'PROCEDURE' AND object_name LIKE :procName
         ORDER BY object_name`,
        [procName]
      )

      return {
        content: [{ type: "text", text: JSON.stringify(result.rows) }]
      }

    }

    if (name === "list_functions") {

      const funcName = args?.name ? args.name.toUpperCase() : '%'

      const result = await conn.execute(
        `SELECT object_name FROM user_procedures
         WHERE object_type = 'FUNCTION' AND object_name LIKE :funcName
         ORDER BY object_name`,
        [funcName]
      )

      return {
        content: [{ type: "text", text: JSON.stringify(result.rows) }]
      }

    }

    if (name === "list_packages") {

      const pkgName = args?.name ? args.name.toUpperCase() : '%'

      const result = await conn.execute(
        `SELECT object_name FROM user_objects
         WHERE object_type = 'PACKAGE' AND object_name LIKE :pkgName
         ORDER BY object_name`,
        [pkgName]
      )

      return {
        content: [{ type: "text", text: JSON.stringify(result.rows) }]
      }

    }

    if (name === "get_procedure_source") {

      const result = await conn.execute(
        `SELECT text FROM user_source
         WHERE type = 'PROCEDURE' AND name = :proc
         ORDER BY line`,
        [args.procedure.toUpperCase()]
      )

      if (result.rows.length === 0) {
        return {
          content: [{ type: "text", text: `Procedure "${args.procedure}" not found` }]
        }
      }

      const source = result.rows.map(row => row[0]).join('')

      return {
        content: [{ type: "text", text: source }]
      }

    }

    if (name === "get_function_source") {

      const result = await conn.execute(
        `SELECT text FROM user_source
         WHERE type = 'FUNCTION' AND name = :func
         ORDER BY line`,
        [args.function.toUpperCase()]
      )

      if (result.rows.length === 0) {
        return {
          content: [{ type: "text", text: `Function "${args.function}" not found` }]
        }
      }

      const source = result.rows.map(row => row[0]).join('')

      return {
        content: [{ type: "text", text: source }]
      }

    }

    if (name === "get_package_source") {

      const pkgName = args.package.toUpperCase()

      // Get package spec
      const specResult = await conn.execute(
        `SELECT text FROM user_source
         WHERE type = 'PACKAGE' AND name = :pkg
         ORDER BY line`,
        [pkgName]
      )

      // Get package body
      const bodyResult = await conn.execute(
        `SELECT text FROM user_source
         WHERE type = 'PACKAGE BODY' AND name = :pkg
         ORDER BY line`,
        [pkgName]
      )

      if (specResult.rows.length === 0 && bodyResult.rows.length === 0) {
        return {
          content: [{ type: "text", text: `Package "${args.package}" not found` }]
        }
      }

      let source = ""

      if (specResult.rows.length > 0) {
        source += "-- PACKAGE SPEC\n"
        source += specResult.rows.map(row => row[0]).join('')
      }

      if (bodyResult.rows.length > 0) {
        source += "\n-- PACKAGE BODY\n"
        source += bodyResult.rows.map(row => row[0]).join('')
      }

      return {
        content: [{ type: "text", text: source }]
      }

    }

  } finally {
    await conn.close()
  }

})

const transport = new StdioServerTransport()
await server.connect(transport)
