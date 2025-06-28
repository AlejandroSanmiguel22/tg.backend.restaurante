# Imagen base
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./
COPY yarn.lock ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

# Eliminar devDependencies
RUN npm prune --production

# Exponer puerto
EXPOSE 8080

# Comando final
CMD ["node", "dist/index.js"]
