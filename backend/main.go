package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// ExecuteRequest represents the incoming code execution request
type ExecuteRequest struct {
	Language string `json:"language"`
	Code     string `json:"code"`
}

// ExecuteResponse represents the response after code execution
type ExecuteResponse struct {
	Output string `json:"output,omitempty"`
	Error  string `json:"error,omitempty"`
}

// LanguageConfig holds configuration for each supported language
type LanguageConfig struct {
	FileExtension string
	CompileCmd    []string // empty if interpreted language
	RunCmd        []string
	Timeout       time.Duration
}

// CodeExecutor handles code compilation and execution
type CodeExecutor struct {
	languages map[string]LanguageConfig
	tempDir   string
}

// NewCodeExecutor creates a new code executor instance
func NewCodeExecutor() *CodeExecutor {
	tempDir := filepath.Join(os.TempDir(), "compilex")
	os.MkdirAll(tempDir, 0755)

	return &CodeExecutor{
		tempDir: tempDir,
		languages: map[string]LanguageConfig{
			"python": {
				FileExtension: ".py",
				RunCmd:        []string{"python3"},
				Timeout:       10 * time.Second,
			},
			"javascript": {
				FileExtension: ".js",
				RunCmd:        []string{"node"},
				Timeout:       10 * time.Second,
			},
			"java": {
				FileExtension: ".java",
				CompileCmd:    []string{"javac"},
				RunCmd:        []string{"java"},
				Timeout:       15 * time.Second,
			},
			"cpp": {
				FileExtension: ".cpp",
				CompileCmd:    []string{"g++", "-o"},
				RunCmd:        []string{}, // Will be set to compiled executable
				Timeout:       15 * time.Second,
			},
			"ruby": {
				FileExtension: ".rb",
				RunCmd:        []string{"ruby"},
				Timeout:       10 * time.Second,
			},
		},
	}
}

// Execute compiles and runs code for the specified language
func (ce *CodeExecutor) Execute(lang, code string) (string, error) {
	config, exists := ce.languages[lang]
	if !exists {
		return "", fmt.Errorf("unsupported language: %s", lang)
	}

	// Create unique temporary directory for this execution
	execID := fmt.Sprintf("%d", time.Now().UnixNano())
	execDir := filepath.Join(ce.tempDir, execID)
	if err := os.MkdirAll(execDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create execution directory: %v", err)
	}
	defer os.RemoveAll(execDir) // Clean up

	// Write code to file
	var filename string
	if lang == "java" {
		// Extract class name for Java
		className := extractJavaClassName(code)
		if className == "" {
			className = "Main"
		}
		filename = className + config.FileExtension
	} else {
		filename = "main" + config.FileExtension
	}

	filePath := filepath.Join(execDir, filename)
	if err := os.WriteFile(filePath, []byte(code), 0644); err != nil {
		return "", fmt.Errorf("failed to write code file: %v", err)
	}

	// Compile if necessary
	var executablePath string
	if len(config.CompileCmd) > 0 {
		output, err := ce.compile(lang, filePath, execDir, config)
		if err != nil {
			return fmt.Sprintf("Compilation Error:\n%s", output), err
		}

		if lang == "cpp" {
			executablePath = filepath.Join(execDir, "main")
		} else if lang == "java" {
			executablePath = strings.TrimSuffix(filename, ".java")
		}
	}

	// Execute code
	return ce.run(lang, filePath, executablePath, execDir, config)
}

// compile compiles the code for compiled languages
func (ce *CodeExecutor) compile(lang, filePath, execDir string, config LanguageConfig) (string, error) {
	var cmd *exec.Cmd

	switch lang {
	case "java":
		cmd = exec.Command(config.CompileCmd[0], filePath)
	case "cpp":
		outputPath := filepath.Join(execDir, "main")
		cmd = exec.Command(config.CompileCmd[0], config.CompileCmd[1], outputPath, filePath)
	default:
		return "", fmt.Errorf("compilation not supported for %s", lang)
	}

	cmd.Dir = execDir
	output, err := cmd.CombinedOutput()
	return string(output), err
}

// run executes the code
func (ce *CodeExecutor) run(lang, filePath, executablePath, execDir string, config LanguageConfig) (string, error) {
	var cmd *exec.Cmd

	switch lang {
	case "python":
		cmd = exec.Command(config.RunCmd[0], filePath)
	case "javascript":
		cmd = exec.Command(config.RunCmd[0], filePath)
	case "ruby":
		cmd = exec.Command(config.RunCmd[0], filePath)
	case "java":
		cmd = exec.Command(config.RunCmd[0], executablePath)
	case "cpp":
		cmd = exec.Command(executablePath)
	default:
		return "", fmt.Errorf("execution not supported for %s", lang)
	}

	cmd.Dir = execDir

	// Set timeout
	done := make(chan bool)
	var output []byte
	var err error

	go func() {
		output, err = cmd.CombinedOutput()
		done <- true
	}()

	select {
	case <-done:
		if err != nil {
			return string(output), err
		}
		return string(output), nil
	case <-time.After(config.Timeout):
		if cmd.Process != nil {
			cmd.Process.Kill()
		}
		return "", fmt.Errorf("execution timeout after %v", config.Timeout)
	}
}

// extractJavaClassName extracts class name from Java code
func extractJavaClassName(code string) string {
	lines := strings.Split(code, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "public class ") {
			parts := strings.Fields(line)
			if len(parts) >= 3 {
				return strings.TrimSuffix(parts[2], "{")
			}
		}
	}
	return ""
}

// HTTP Handlers

func (ce *CodeExecutor) executeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ExecuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response := ExecuteResponse{Error: "Invalid JSON request"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if req.Language == "" || req.Code == "" {
		response := ExecuteResponse{Error: "Language and code are required"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Execute code
	output, err := ce.Execute(req.Language, req.Code)

	response := ExecuteResponse{}
	if err != nil {
		response.Error = err.Error()
		if output != "" {
			response.Output = output
		}
		w.WriteHeader(http.StatusUnprocessableEntity)
	} else {
		response.Output = output
		w.WriteHeader(http.StatusOK)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (ce *CodeExecutor) healthHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "healthy",
		"languages": []string{"python", "javascript", "java", "cpp", "ruby"},
		"timestamp": time.Now().UTC(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	executor := NewCodeExecutor()

	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/execute", executor.executeHandler).Methods("POST")
	api.HandleFunc("/health", executor.healthHandler).Methods("GET")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Compilex Backend starting on port %s\n", port)
	fmt.Printf("📊 Health check: http://localhost:%s/api/health\n", port)
	fmt.Printf("🔧 Supported languages: Python, JavaScript, Java, C++, Ruby\n")

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
