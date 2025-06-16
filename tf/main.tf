# Data source for the default VPC, assuming we're using the default VPC.
data "aws_vpc" "default" {
  default = true
}

# Generating new strong SSH key-pair for connecting to the EC2 instance
resource "tls_private_key" "ec2_key" {
  algorithm = "ED25519"
}

# Refering the created key pair to provision EC2 insatnce with it
resource "aws_key_pair" "f4u_ssh_key" {
  key_name   = "f4u_ssh_key"
  public_key = tls_private_key.ec2_key.public_key_openssh
}


# Create a security group with rules for SSH, HTTP, and HTTPS.
resource "aws_security_group" "f4u_instance_sg" {
  name        = "food-4-you-security-group"
  description = "Allow SSH, HTTP, HTTPS and API inbound traffic"
  vpc_id      = data.aws_vpc.default.id # Reference the default VPC. Adjust or remove if using a custom VPC.

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "API"
    from_port   = 3311
    to_port     = 3311
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Creating EC2 instance with 30GB disk (maximum size for free-tier)
resource "aws_instance" "f4u_app_server" {
  ami           = var.instance_ami
  instance_type          = "t2.micro"
  key_name               = aws_key_pair.f4u_ssh_key.key_name
  vpc_security_group_ids = [aws_security_group.f4u_instance_sg.id]

  root_block_device {
    delete_on_termination = true
    volume_size           = 30
  }

  metadata_options {
    http_endpoint = "enabled"
  }

  private_dns_name_options {
    enable_resource_name_dns_a_record = true
    hostname_type                     = "ip-name" #var.website_address # Update this in the 'variables.tf' file
  }

  # Disable password authentication for SSH
  user_data = <<-EOF
    #!/bin/bash
    sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    systemctl restart sshd
    EOF

  tags = {
    Name        = var.instance_name
    Environment = "Prod"
  }
}


# Creating S3 bucket
resource "aws_s3_bucket" "f4u_bucket" {
  bucket = var.bucket_name

  tags = {
    Name        = var.bucket_name
    Environment = "Prod"
  }
}

resource "aws_s3_bucket_ownership_controls" "f4u_bucket_owner" {
  bucket = aws_s3_bucket.f4u_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "f4u_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.f4u_bucket_owner]

  bucket = aws_s3_bucket.f4u_bucket.id
  acl    = "private"
}


# Creating a user for the S3 bucket with minimal R/W permissions
resource "aws_iam_user" "f4u_s3_user" {
  name = "f4u_s3_user"
}

data "aws_iam_policy_document" "s3_policy_doc" {
  statement {
    sid    = "ListBucket"
    effect = "Allow"
    actions = [
      "s3:ListBucket"
    ]
    resources = [
      aws_s3_bucket.f4u_bucket.arn
    ]
  }

  statement {
    sid    = "MutateBucketContents"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = [
      "${aws_s3_bucket.f4u_bucket.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "f4u_s3_policy" {
  name   = "f4u_s3_policy"
  policy = data.aws_iam_policy_document.s3_policy_doc.json
}

resource "aws_iam_user_policy_attachment" "attach_policy" {
  user       = aws_iam_user.f4u_s3_user.name
  policy_arn = aws_iam_policy.f4u_s3_policy.arn
}

resource "aws_iam_access_key" "f2u_user_access_key" {
  user = aws_iam_user.f4u_s3_user.name
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.f4u_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowPublicRead"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.f4u_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_public_access_block" "allow_public_policy" {
  bucket                  = aws_s3_bucket.f4u_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
