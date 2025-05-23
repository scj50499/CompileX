import React, { useState, useEffect, useRef } from 'react';
import { Play, Code, Terminal, ChevronUp, ChevronDown, Moon, Sun, RefreshCw } from 'lucide-react';

const languages = [
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "bg-yellow-500",
    defaultCode: `# Python Example
print("Hello, Compilex!")
x = 10
y = 20
print(f"Sum: {x + y}")`,
    extension: ".py",
    keywords: [
      "def",
      "class",
      "import",
      "from",
      "if",
      "elif",
      "else",
      "for",
      "while",
      "return",
      "print",
      "True",
      "False",
      "None",
    ],
    comments: ["#"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "🟨",
    color: "bg-yellow-400",
    defaultCode: `// JavaScript Example
console.log("Hello, Compilex!");
const x = 10;
const y = 20;
console.log(\`Sum: \${x + y}\`);`,
    extension: ".js",
    keywords: [
      "const",
      "let",
      "var",
      "function",
      "class",
      "if",
      "else",
      "for",
      "while",
      "return",
      "import",
      "export",
      "default",
      "true",
      "false",
      "null",
      "undefined",
    ],
    comments: ["//", "/*", "*/"],
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    color: "bg-orange-500",
    defaultCode: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Compilex!");
        int x = 10, y = 20;
        System.out.println("Sum: " + (x + y));
    }
}`,
    extension: ".java",
    keywords: [
      "public",
      "private",
      "protected",
      "class",
      "interface",
      "extends",
      "implements",
      "static",
      "final",
      "void",
      "int",
      "boolean",
      "String",
      "new",
      "return",
      "if",
      "else",
      "for",
      "while",
    ],
    comments: ["//", "/*", "*/"],
  },
  {
    id: "cpp",
    name: "C++",
    icon: "⚡",
    color: "bg-blue-500",
    defaultCode: `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Compilex!" << endl;
    int x = 10, y = 20;
    cout << "Sum: " << (x + y) << endl;
    return 0;
}`,
    extension: ".cpp",
    keywords: [
      "int",
      "float",
      "double",
      "char",
      "void",
      "bool",
      "class",
      "struct",
      "template",
      "namespace",
      "using",
      "return",
      "if",
      "else",
      "for",
      "while",
      "switch",
      "case",
      "break",
      "continue",
    ],
    comments: ["//", "/*", "*/"],
  },
  {
    id: "ruby",
    name: "Ruby",
    icon: "💎",
    color: "bg-red-500",
    defaultCode: `# Ruby Example
puts "Hello, Compilex!"
x = 10
y = 20
puts "Sum: #{x + y}"`,
    extension: ".rb",
    keywords: [
      "def",
      "class",
      "module",
      "if",
      "elsif",
      "else",
      "unless",
      "case",
      "when",
      "while",
      "until",
      "for",
      "begin",
      "end",
      "return",
      "puts",
      "true",
      "false",
      "nil",
    ],
    comments: ["#"],
  },
];

// Simple Button component since we don't have shadcn/ui
const Button = ({ children, onClick, disabled, className, variant = "default", size = "default", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    icon: "h-10 w-10"
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Simple Tooltip components
const TooltipProvider = ({ children }) => <div>{children}</div>;
const Tooltip = ({ children }) => <div className="relative group">{children}</div>;
const TooltipTrigger = ({ children, asChild }) => (
  <div className="cursor-pointer">{children}</div>
);
const TooltipContent = ({ children, side = "top" }) => (
  <div className="absolute z-50 px-3 py-1 text-sm text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2">
    {children}
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
  </div>
);

// Utility function for combining class names
const cn = (...args) => args.filter(Boolean).join(' ');

export default function Compilex() {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const [theme, setTheme] = useState("dark");
  const textareaRef = useRef(null);

  useEffect(() => {
    // Set default language when component mounts
    if (languages.length > 0 && !selectedLanguage) {
      handleLanguageSelect(languages[0]);
    }
  }, [selectedLanguage]);

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang.id);
    setCode(lang.defaultCode);
    setOutput("");
  };

  const handleRunCode = async () => {
    if (!selectedLanguage || !code.trim()) {
      setOutput("Please select a language and enter some code.");
      return;
    }

    setIsRunning(true);
    setOutput("Running code...");
    setIsOutputExpanded(true);

    try {
      // Real API call to your Go backend
      const response = await fetch('http://localhost:8080/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          code: code,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setOutput(result.output || 'Code executed successfully!');
      } else {
        setOutput(`Error: ${result.error || 'Failed to execute code'}`);
      }
    } catch (error) {
      setOutput(`Connection Error: ${error.message}\n\nMake sure your Go backend is running on port 8080.`);
    } finally {
      setIsRunning(false);
    }
  };

  const selectedLang = languages.find((lang) => lang.id === selectedLanguage);

  // Simple syntax highlighting function
  const highlightCode = (code, language) => {
    if (!code) return "";

    const lang = languages.find((l) => l.id === language);
    if (!lang) return code;

    // Split code into lines
    const lines = code.split("\n");

    // Process each line
    return lines
      .map((line) => {
        // Check for comments
        let isComment = false;
        for (const commentStart of lang.comments) {
          if (line.trim().startsWith(commentStart)) {
            isComment = true;
            break;
          }
        }

        if (isComment) {
          return `<span class="text-slate-500 dark:text-slate-400">${line}</span>`;
        }

        // Highlight keywords
        let highlightedLine = line;
        for (const keyword of lang.keywords) {
          const regex = new RegExp(`\\b${keyword}\\b`, "g");
          highlightedLine = highlightedLine.replace(
            regex,
            `<span class="text-purple-600 dark:text-purple-400 font-semibold">${keyword}</span>`,
          );
        }

        // Highlight strings
        highlightedLine = highlightedLine.replace(
          /"([^"]*)"/g,
          '<span class="text-green-600 dark:text-green-400">"$1"</span>',
        );
        highlightedLine = highlightedLine.replace(
          /'([^']*)'/g,
          "<span class=\"text-green-600 dark:text-green-400\">'$1'</span>",
        );
        highlightedLine = highlightedLine.replace(
          /`([^`]*)`/g,
          '<span class="text-green-600 dark:text-green-400">`$1`</span>',
        );

        // Highlight numbers
        highlightedLine = highlightedLine.replace(
          /\b(\d+)\b/g,
          '<span class="text-blue-600 dark:text-blue-400">$1</span>',
        );

        // Highlight operators
        highlightedLine = highlightedLine.replace(
          /([+\-*/%=<>!&|]+)/g,
          '<span class="text-orange-600 dark:text-orange-400">$1</span>',
        );

        return highlightedLine;
      })
      .join("\n");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-mono text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden ${theme}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <Code className="w-6 h-6" />
          <h1 className="text-lg font-bold">Compilex</h1>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="icon" variant="ghost" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleLanguageSelect(languages.find(l => l.id === selectedLanguage))}>
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Language selector */}
      <div className="flex flex-wrap gap-2 px-4 py-2 overflow-x-auto">
        {languages.map((lang) => (
          <Button
            key={lang.id}
            onClick={() => handleLanguageSelect(lang)}
            className={`text-sm ${selectedLanguage === lang.id ? lang.color + ' text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <span className="mr-1">{lang.icon}</span>
            {lang.name}
          </Button>
        ))}
      </div>

      {/* Code Editor */}
      <div className="flex-1 p-4 overflow-auto">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-slate-100 dark:bg-slate-900 text-sm p-4 rounded-md font-mono text-slate-800 dark:text-slate-100 resize-none focus:outline-none"
        ></textarea>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur">
        <Button onClick={handleRunCode} disabled={isRunning}>
          <Play className="w-4 h-4 mr-2" /> Run
        </Button>
      </div>

      {/* Output */}
      {isOutputExpanded && (
        <div className="bg-black text-green-500 font-mono text-sm p-4 overflow-y-auto max-h-60 border-t border-slate-500">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Output</span>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setIsOutputExpanded(false)}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}

      {!isOutputExpanded && (
        <div className="px-4 py-2 bg-black text-white flex justify-between items-center">
          <span>Output Hidden</span>
          <Button size="icon" variant="ghost" onClick={() => setIsOutputExpanded(true)}>
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}