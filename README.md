# Mini Oracle MCP Server

Model Context Protocol (MCP) server untuk koneksi ke database Oracle. Memungkinkan AI assistant untuk berinteraksi dengan database Oracle melalui berbagai tools.

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
| `list_tables` | List semua tabel dalam schema |
| `list_views` | List semua views dalam schema (support filter nama) |
| `describe_table` | Lihat struktur kolom tabel/view |
| `get_view_source` | Lihat source code SQL dari sebuah view |
| `query` | Jalankan SQL query (max 50 rows) |
| `list_procedures` | List stored procedures (support filter nama) |
| `list_functions` | List functions (support filter nama) |
| `list_packages` | List packages (support filter nama) |
| `get_procedure_source` | Lihat source code stored procedure |
| `get_function_source` | Lihat source code function |
| `get_package_source` | Lihat source code package (spec & body) |

## Contoh Penggunaan

### List Semua Tabel
```
list_tables
```

### List Views dengan Filter
```
list_views(name: "V_%")
```

### Describe Tabel
```
describe_table(table: "M_RBI_BILLING")
```

### Jalankan Query
```
query(sql: "SELECT * FROM M_ACCOUNT WHERE STATUS = 'ACTIVE'")
```

### List Packages
```
list_packages(name: "PACK_%")
```

### Lihat Source Package
```
get_package_source(package: "PACK_EFAKTUR")
```

### List Procedures
```
list_procedures(name: "%EFAKTUR%")
```

### Lihat Source Procedure
```
get_procedure_source(procedure: "SAVE_EINVOICE")
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
