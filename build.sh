#!/bin/bash

# Build script for Tree-sitter Neruda grammar

# Check if tree-sitter is installed
if ! command -v tree-sitter &> /dev/null; then
    echo "tree-sitter could not be found. Please install it with: npm install -g tree-sitter-cli"
    exit 1
fi

echo "Building Tree-sitter grammar for Neruda..."

# Generate the parser
tree-sitter generate

echo "Grammar built successfully!"

# Test the parser
echo "Testing parser with sample code..."
echo "function test() { return 42; }" | tree-sitter parse -
