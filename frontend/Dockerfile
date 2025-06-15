# frontend/Dockerfile
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies
RUN rm -rf node_modules
RUN npm install

# Copy source code
COPY . .

EXPOSE 5173

# Add host flag to make it accessible outside container
CMD ["npm", "run", "dev", "--", "--host"]
