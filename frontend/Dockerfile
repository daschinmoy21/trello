FROM node:16

WORKDIR /app

# Copy package.json and package-lock.json first
COPY package.json package-lock.json ./

# Install dependencies using npm ci for a clean and deterministic install
RUN npm ci

# Copy the rest of the application code
COPY . .

# Add debugging steps to verify installation
RUN ls -la /app/node_modules/.bin
RUN ls -la /app/node_modules/react-scripts/bin
RUN cat /app/node_modules/.bin/react-scripts || echo "react-scripts not found"

# Build the React application
RUN npm run build

# Install serve to serve the built application
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Serve the built application
CMD ["serve", "-s", "build", "-l", "3000"]
