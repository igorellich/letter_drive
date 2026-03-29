# Используем стабильную версию Node.js
FROM node:22-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы манифестов
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm install

# Остальной код не копируем, так как он будет подключен через volume
# Но открываем порт для Vite/Webpack
EXPOSE 5173

# Запускаем сервер разработки
CMD ["npm", "run", "dev", "--", "--host"]
