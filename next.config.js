server {
    listen 8081;  # Usamos un puerto distinto porque el 80 ya está ocupado

    server_name credenciales.cruzrojacancun.org;

    location /credenciales/ {
        proxy_pass http://10.0.1.12:3000/;  # Aquí la IP interna del contenedor Docker
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
