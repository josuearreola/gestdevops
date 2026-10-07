# 1. Imagen base oficial y ligera
FROM node:20-alpine

# 2. Directorio de trabajo en el contenedor
WORKDIR /app

# 3. Copiar manifiestos de dependencias
COPY package*.json ./

# 4. Instalar únicamente dependencias de producción
RUN npm ci --omit=dev

# 5. Copiar código fuente
COPY index.js ./

# 6. Usar usuario no privilegiado (buenas prácticas de seguridad)
USER node

# 7. Exponer puerto en el que escucha la API
EXPOSE 3000

# 8. Comando de ejecución
CMD ["node", "index.js"]
