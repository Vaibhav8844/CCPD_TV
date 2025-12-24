FROM node:22-bullseye

# Install system dependency for pdf-poppler
RUN apt-get update && apt-get install -y poppler-utils

# App directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code
COPY backend/ .

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["node", "index.js"]
