FROM nginx:alpine

# Copy the public directory contents to nginx html directory
COPY public/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
