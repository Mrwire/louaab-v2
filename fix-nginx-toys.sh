#!/bin/bash
# Script to fix nginx configuration for serving toy images
set -e

echo "=== Backing up current nginx config ==="
cp /etc/nginx/sites-enabled/louaab.ma /etc/nginx/sites-enabled/louaab.ma.bak

echo "=== Creating new config with /toys/ location ==="
cat > /tmp/toys_location.txt << 'ENDBLOCK'
    # Serve static toy images directly
    location /toys/ {
        alias /root/louaab-project/public/toys/;
        expires 30d;
        add_header Cache-Control "public";
        try_files $uri $uri/ =404;
    }

ENDBLOCK

# Insert the toys location before "location / {"
awk '
/location \/ \{/ && !inserted {
    while ((getline line < "/tmp/toys_location.txt") > 0) print line
    inserted = 1
}
{print}
' /etc/nginx/sites-enabled/louaab.ma.bak > /etc/nginx/sites-enabled/louaab.ma

echo "=== Testing nginx configuration ==="
nginx -t

echo "=== Reloading nginx ==="
systemctl reload nginx

echo "=== Testing image access ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost/toys/import/cellImage_0_190.jpg

echo ""
echo "=== DONE ==="
