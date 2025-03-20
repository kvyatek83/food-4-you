
# Outputing SSH key and S3 User AWS Credentials into local files
resource "local_sensitive_file" "f2u_user_credentials" {
  filename = "s3-user-cred"
  content  = <<EOF
Access Key: ${aws_iam_access_key.f2u_user_access_key.id}
Secret Access Key: ${aws_iam_access_key.f2u_user_access_key.secret}
EOF
}

resource "local_sensitive_file" "env_file" {
  filename        = "../.env"
  file_permission = "0600"
  content         = <<EOF
JWT_SECRET=nesRUIpghw37459tgwjU95o4
EXPIRES_IN=24h
PORT=3311
ADMIN_NAME=${var.server_admin_name}
ADMIN_PASSWORD=${var.server_admin_password}
ADMIN_ROLE=${var.server_admin_role}
RESET_DB=${var.reset_db}
DB_PATH=app.db
AWS_REGION=${var.aws_region}
AWS_ACCESS_KEY_ID=${aws_iam_access_key.f2u_user_access_key.id}
AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.f2u_user_access_key.secret}
AWS_S3_BUCKET="${aws_s3_bucket.f4u_bucket.arn}"
PUBLIC_ADDRESS=${var.website_address}
EOF
}

resource "local_sensitive_file" "ec2_user_ssh_key" {
  filename        = "id_f4uec2"
  content         = tls_private_key.ec2_key.private_key_openssh
  file_permission = "0600"
}

resource "local_file" "caddy_reverse_proxy_file" {
  filename = "proxy/Caddyfile"
  content  = <<EOF
${var.website_address}
    reverse_proxy :3311
EOF
}

resource "local_file" "caddy_service_file" {
  filename = "proxy/caddy.service"
  content  = <<EOF
[Unit]
Description=Caddy
Documentation=https://caddyserver.com/docs/
After=app-server.service
Requires=app-server.service

[Service]
Type=notify
User=${var.instance_user}
Group=${var.instance_user}
ExecStart=/usr/bin/caddy run --environ --config /home/${var.instance_user}/proxy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /home/${var.instance_user}/proxy/Caddyfile --force
TimeoutStopSec=5s
LimitNOFILE=1048576
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF
}

resource "local_file" "nodejs_service_file" {
  filename = "app-server.service"
  content  = <<EOF
[Unit]
Description=Food-4-you App server
After=network.target network-online.target
Requires=network-online.target

[Service]
Type=simple
User=${var.instance_user}
Group=${var.instance_user}
WorkingDirectory=/home/${var.instance_user}/app
ExecStart=npm run start
TimeoutStopSec=5s
LimitNOFILE=1048576
ProtectSystem=full
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
EOF
}
