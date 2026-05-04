# Mini Oracle MCP Server

Model Context Protocol (MCP) server untuk koneksi ke database Oracle. Server ini hanya menyediakan tool `query`.

## Prerequisites

1. **Node.js** >= 18.x
2. **Oracle Instant Client** - Download dari [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/downloads.html)
3. **npm** package manager

## Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

Copy file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi database Anda:

```env
# Oracle Database Configuration
DB_USER=username_database
DB_PASSWORD=password_anda
DB_CONNECT_STRING=host:port/service_name

# Oracle Client Library Path (macOS/Linux)
LD_LIBRARY_PATH=/path/to/oracle/instantclient
```

**Contoh konfigurasi:**

```env
DB_USER=scott
DB_PASSWORD=tiger
DB_CONNECT_STRING=localhost:1521/ORCL

# macOS
LD_LIBRARY_PATH=/opt/oracle/instantclient_21_8

# Linux
LD_LIBRARY_PATH=/usr/lib/oracle/21/client64/lib
```

## Tools yang Tersedia

| Tool | Deskripsi |
|------|-----------|
| `query` | Jalankan SQL query (max 150 rows) |

## Contoh Penggunaan

### Jalankan Query
```
query(sql: "SELECT * FROM M_ACCOUNT WHERE STATUS = 'ACTIVE'")
```

## Konfigurasi di Claude Desktop

Tambahkan konfigurasi berikut ke file config Claude Desktop:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "oracle": {
      "command": "node",
      "args": ["/path/to/oracle-mcp/server.js"],
      "env": {
        "DB_USER": "your_user",
        "DB_PASSWORD": "your_password",
        "DB_CONNECT_STRING": "host:port/service_name",
        "LD_LIBRARY_PATH": "/path/to/oracle/instantclient"
      }
    }
  }
}
```

## Struktur Project

```
oracle-mcp/
├── server.js          # Main server MCP
├── package.json       # Dependencies
├── .env.example       # Template environment
├── .env               # Environment configuration
└── README.md          # Dokumentasi
```

## Troubleshooting

### Error: Unable to load Oracle Client Library

Pastikan path `LD_LIBRARY_PATH` mengarah ke folder yang benar dimana `libclntsh.so` (Linux) atau `libclntsh.dylib` (macOS) berada.

### Error: ORA-12162: TNS:net service name is incorrectly specified

Periksa format `DB_CONNECT_STRING`. Format yang benar: `host:port/service_name` atau `host:port:SID`

### Error: Module not found

Jalankan `npm install` untuk menginstall semua dependencies.

## License

ISC
