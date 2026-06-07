#!/bin/bash
echo "🛑 Stopping all IntelliMeet services..."

echo "[1/4] Stopping Spring Boot..."
pkill -f java

echo "[2/4] Stopping FastAPI..."
pkill -f uvicorn

echo "[3/4] Stopping Ollama..."
pkill -f ollama

echo "[4/4] Stopping PostgreSQL..."
service postgresql stop

echo "✅ All services stopped."
