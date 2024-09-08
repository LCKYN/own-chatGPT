FROM node:19.5.0-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 7100

# Run the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
