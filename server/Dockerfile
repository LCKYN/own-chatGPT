FROM node:18-alpine

WORKDIR /app

# Copy package.json first for better caching
COPY package.json ./
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 7101

CMD ["npm", "run", "dev"]
