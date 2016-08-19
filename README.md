# TinyAppsDevR2
My Personal Website, Frontend in ReactJS, Backend in NodeJS



# Configuration

* Fontend
```
npm run build
```

* Backend, Conf for Nginx
```
upstream nodejs {
    server unix:/tmp/TinyAppsDev.NodeJS;
}

server {
    listen       80;
    server_name  tinyappsdev.com;

    gzip on;

    charset utf-8;

    location / {
        root   /www/TinyAppsDev/client;
        index  index.html index.htm;

    }

    location /web {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://nodejs;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

}
```
