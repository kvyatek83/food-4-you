#!/bin/bash

curl -fsSL https://github.com/caddyserver/caddy/releases/download/v2.9.1/caddy_2.9.1_linux_amd64.tar.gz -o caddy.tar.gz

tar -zxf caddy.tar.gz && sudo mv caddy /usr/bin/ && rm caddy.tar.gz

sudo mv ~/proxy/caddy.service /etc/systemd/system/caddy.service
sudo systemctl daemon-reload
# sudo systemctl enable --now caddy