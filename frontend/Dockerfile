# FROM chooses the official Node image used for the Vite development server.
FROM node:22-alpine

# WORKDIR sets /app as the directory for dependency installation and startup.
WORKDIR /app

# COPY adds package metadata first so Docker can cache the dependency layer.
COPY package*.json ./

# RUN installs the exact, reproducible dependency tree from package-lock.json.
RUN npm ci

# COPY adds the Vite configuration, HTML, and React source files.
COPY . .

# EXPOSE documents Vite's container port; Compose maps it to localhost:5173.
EXPOSE 5173

# CMD runs Vite on 0.0.0.0 so it is reachable through Docker's port mapping.
CMD ["npm", "run", "dev"]
