# Static site: nginx serves index.html, app.js, styles.css and data/.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html app.js styles.css /usr/share/nginx/html/
COPY data/episodes.json data/cast.json data/eras.js data/tags.js /usr/share/nginx/html/data/
EXPOSE 8080
