# Estágio 1: Build da aplicação React
FROM node:20-alpine as build

WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json ./
RUN npm install

# Copiar os arquivos do código
COPY . .

# Construir a aplicação otimizada para produção
RUN npm run build

# Estágio 2: Servidor Nginx
FROM nginx:alpine

# Copiar os arquivos compilados do estágio anterior para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Substituir a configuração padrão do Nginx pela nossa
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
