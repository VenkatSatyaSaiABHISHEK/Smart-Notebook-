FROM node:20-bullseye-slim

# Install Python and GCC for code execution
RUN apt-get update && apt-get install -y python3 python3-pip gcc libc6-dev && rm -rf /var/lib/apt/lists/*

# Symlink python3 to python if needed
RUN ln -s /usr/bin/python3 /usr/bin/python || true

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
