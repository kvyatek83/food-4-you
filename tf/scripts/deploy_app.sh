#!/bin/bash

curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs

node -v
npm -v

cd ~/app && npm install

sudo mv ~/app-server.service /etc/systemd/system/app-server.service
sudo systemctl daemon-reload
sudo systemctl enable --now app-server

echo "NodeJS Server has been deployed and is running"