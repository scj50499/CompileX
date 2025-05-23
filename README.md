# Compilex - Multi-Language Code Execution Platform

Compilex is a modern, web-based code execution platform that supports multiple programming languages including Python, Java, C++, Ruby, and JavaScript. It features a beautiful, responsive interface with syntax highlighting, real-time code execution, and a collapsible output console.

## 🚀 Features

- **Multi-Language Support**: Python, Java, C++, Ruby, JavaScript
- **Real-time Code Execution**: Secure server-side code compilation and execution
- **Syntax Highlighting**: Built-in syntax highlighting for all supported languages
- **Modern UI**: Clean, responsive interface with dark/light theme support
- **Collapsible Console**: Expandable output console for better space management
- **Security**: Sandboxed execution with timeout protection
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│   React Frontend│ ───────────────▶│   Go Backend    │
│   (Next.js)     │                 │   (REST API)    │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │  Code Execution │
                                    │   Environment   │
                                    └─────────────────┘
```

## 📋 Prerequisites

### Development Environment
- **Node.js** 18.0+ 
- **Go** 1.19+
- **Git**

### Runtime Dependencies (for code execution)
- **Python** 3.8+
- **Java** JDK 11+
- **GCC/G++** (for C++ compilation)
- **Ruby** 2.7+
- **Node.js** (for JavaScript execution)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/compilex.git
cd compilex
```

### 2. Backend Setup
```bash
cd backend
go mod init compilex
go get github.com/gorilla/mux
go get github.com/rs/cors
go mod tidy
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# or if using the provided Next.js code
npx create-next-app@latest . --typescript --tailwind --eslint
npm install lucide-react
npm install next-themes
```

### 4. Install Runtime Dependencies

#### macOS (using Homebrew)
```bash
# Install programming languages
brew install python3 openjdk@11 gcc ruby node

# Add Java to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3 openjdk-11-jdk build-essential ruby nodejs npm
```

#### Windows
- Install Python from [python.org](https://python.org)
- Install Java JDK from [Oracle](https://www.oracle.com/java/technologies/downloads/)
- Install MinGW-w64 for C++ compilation
- Install Ruby from [rubyinstaller.org](https://rubyinstaller.org)
- Install Node.js from [nodejs.org](https://nodejs.org)

## 🚀 Running Locally

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
go run main.go
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Production Mode

**Backend:**
```bash
cd backend
go build -o compilex-backend main.go
./compilex-backend
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📝 API Documentation

### Endpoints

#### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "languages": ["python", "java", "cpp", "ruby", "javascript"],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### `POST /api/execute`
Execute code

**Request:**
```json
{
  "language": "python",
  "code": "print('Hello, World!')"
}
```

**Response:**
```json
{
  "output": "Hello, World!\n"
}
```

**Error Response:**
```json
{
  "error": "Compilation error",
  "output": "SyntaxError: invalid syntax"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🗺️ Roadmap

- [ ] More language support (Go, Rust, PHP)
- [ ] Collaborative editing
- [ ] Code sharing and permalinks
- [ ] User authentication
- [ ] Code templates and snippets
- [ ] Performance metrics
- [ ] Mobile app

---

**Built with ❤️ using Go and React**