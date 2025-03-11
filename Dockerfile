# Use Nginx as the base image
FROM nginx:alpine

# Set the working directory
WORKDIR /usr/share/nginx/html/paintz/app

# Copy only the 'app' directory contents into the working directory
COPY app/ .

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]