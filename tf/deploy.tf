locals {
  src_archive = "src.tar.gz"
}

resource "null_resource" "compress_and_upload" {
  depends_on = [aws_instance.f4u_app_server, local_file.caddy_reverse_proxy_file, local_file.caddy_service_file, local_file.nodejs_service_file]


  # 1. Build the Angular frontend locally
  provisioner "local-exec" {
    command = "cd ../ && npm install && npm run build"
  }

  # 2. compresses the local source directory while ignoring specified directories.
  provisioner "local-exec" {
    # command = "tar -zcf ${local.src_archive} --exclude='tf' --exclude='.git' --exclude='.angular' --exclude='.vscode' --exclude='node_modules' -C ../ ."
    command = "tar -zcf ${local.src_archive} --exclude='tf' --exclude='server/app.db' --exclude='.angular' --exclude='.vscode' --exclude='node_modules' -C ../ ."
  }

  # uploads the tar.gz file to the EC2 instance.
  provisioner "file" {
    source      = local.src_archive
    destination = "/home/${var.instance_user}/${local.src_archive}"

    connection {
      type        = "ssh"
      host        = aws_instance.f4u_app_server.public_ip
      user        = var.instance_user
      private_key = tls_private_key.ec2_key.private_key_pem
    }
  }

  provisioner "file" {
    source      = "app-server.service"
    destination = "/home/${var.instance_user}/app-server.service"

    connection {
      type        = "ssh"
      host        = aws_instance.f4u_app_server.public_ip
      user        = var.instance_user
      private_key = tls_private_key.ec2_key.private_key_pem
    }
  }

  # Extract
  provisioner "remote-exec" {
    inline = [
      "mkdir -p /home/${var.instance_user}/app && tar -xzf /home/${var.instance_user}/${local.src_archive} -C /home/${var.instance_user}/app",
    ]

    connection {
      type        = "ssh"
      host        = aws_instance.f4u_app_server.public_ip
      user        = var.instance_user
      private_key = tls_private_key.ec2_key.private_key_pem
    }
  }

  # Upload generated Caddyfile for reverse-proxy with HTTPS
  provisioner "file" {
    source      = "proxy" # copies the entire directory
    destination = "/home/${var.instance_user}"

    connection {
      type        = "ssh"
      host        = aws_instance.f4u_app_server.public_ip
      user        = var.instance_user
      private_key = tls_private_key.ec2_key.private_key_pem
    }
  }

  # Install node and deploy
  provisioner "remote-exec" {
    scripts = [
      "scripts/deploy_app.sh",
      "scripts/proxy_setup.sh",
    ]

    connection {
      type        = "ssh"
      host        = aws_instance.f4u_app_server.public_ip
      user        = var.instance_user
      private_key = tls_private_key.ec2_key.private_key_pem
    }
  }
}
