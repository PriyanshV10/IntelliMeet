#!/bin/bash
echo "🚀 Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📦 Copying Frontend to Spring Boot..."
mkdir -p backend/src/main/resources/static
rm -rf backend/src/main/resources/static/*
cp -r frontend/dist/* backend/src/main/resources/static/

if [ -z "$1" ]; then
    if [ -f ".gpu_ip" ]; then
        GPU_IP=$(cat .gpu_ip)
    else
        echo "Error: Please provide the new GPU IP as an argument."
        echo "Usage: ./deploy_all.sh <GPU_IP>"
        exit 1
    fi
else
    GPU_IP=$1
    echo $GPU_IP > .gpu_ip
fi

echo "🚀 Deploying IntelliMeet (AI + Full Stack + Scripts) to JarvisLabs GPU at $GPU_IP..."

rsync -avz -e "ssh -o StrictHostKeyChecking=no" \
  --exclude 'venv' \
  --exclude '__pycache__' \
  --exclude 'chroma_data' \
  --exclude '.env' \
  --exclude 'target' \
  --exclude 'uploads' \
  --exclude '.git' \
  ./ai ./backend ./setup_gpu.sh ./start_all.sh ./stop_all.sh root@${GPU_IP}:/root/

echo "✅ Deployment Complete to $GPU_IP!"
