# Printing a nice message at the end to help with next steps
output "AWS_credentials_info_message" {
  value = "An auto-generated .env file is present in this directory which includes all the settings for the food-4-you app"
}

output "DNS_info_message" {
  value = "You can access the app in this address: ${var.website_address}"
}

output "DNS_fallback_message" {
  value = "As a fallback in case the ${var.website_address} URL is down. You can access the app API with this AWS public DNS entry: ${aws_instance.f4u_app_server.public_dns}"
}

output "EC2_instance_info_message" {
  value = "The Food-4-You EC2 instance SSH key is saved as '${local_sensitive_file.ec2_user_ssh_key.filename}'. Use it to SSH into the VM like this:   ssh -i ${local_sensitive_file.ec2_user_ssh_key.filename} ${var.instance_user}@${aws_instance.f4u_app_server.public_ip}"
}