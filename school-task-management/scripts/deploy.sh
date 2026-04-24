#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment..."

# Pull latest changes
echo "Pulling latest changes from git..."
git pull origin main

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
npm install
tsc
cd ..

# Run database migrations
echo "Running database migrations..."
cd backend
npx sequelize-cli db:migrate
cd ..

# Restart PM2 process
echo "Restarting PM2 process..."
cd backend
pm2 restart ecosystem.config.js
cd ..

echo "Deployment completed successfully!"