#!/bin/bash
echo "🚀 Starting all IntelliMeet services..."

# 1. Start Ollama
echo "[1/4] Starting Ollama..."
pkill -f ollama
sleep 2
nohup ollama serve > ollama.log 2>&1 &
sleep 2

# 2. Start PostgreSQL
echo "[2/4] Starting PostgreSQL..."
service postgresql start

# 3. Start FastAPI
echo "[3/4] Starting FastAPI..."
cd ai
pkill -f uvicorn
nohup uvicorn main:app --port 8000 > fastapi.log 2>&1 &
cd ..

# 4. Start Spring Boot
echo "[4/4] Starting Spring Boot Backend..."
cd backend
pkill -f java
sleep 2
mvn clean package -DskipTests
# Find the generated jar and run it
JAR_FILE=$(find target -name "*.jar" | head -n 1)
nohup java -jar $JAR_FILE > springboot.log 2>&1 &
cd ..

echo "✅ All services successfully started in the background!"
echo "Check springboot.log, fastapi.log, and ollama.log for details."
