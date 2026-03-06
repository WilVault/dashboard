# --- Build the React App ---
FROM node:20-alpine AS build
WORKDIR /app

# Unlock the arguments
ARG VITE_API_URL

# Make them available to the build process
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Serve with Nginx ---
FROM nginx:alpine
# Copy the built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy our specific frontend nginx config
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]