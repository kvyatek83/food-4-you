######### AWS ###########

variable "aws_region" {
  description = "The region to deploy the EC2 insatnce to"
  type        = string
  default     = "sa-east-1"  # Sau-Paulo
}

variable "instance_ami" {
  description = "This is the AMI ID to use  for the EC2 instance. It is different for each region in AWS. the default value here fits sa-east-1 region"
  type        = string
  default     = "ami-09bc0685970d93c8d" # Change this if you also change the default "sa-east-1" region
}

variable "instance_name" {
  description = "The name for the EC2 instance"
  type        = string
  default     = "chabad-food-4-you-ec2" # change this 
}

variable "instance_user" {
  description = "This is username used for connecting to the EC2 instance. usually its either 'ec2-user' or 'admin'"
  type        = string
  default     = "ec2-user" # change this if you change the ami to a different OS. different operating systems in AWS may have different default user
}

variable "bucket_name" {
  description = "The name for the S3 bucket"
  type        = string
  default     = "food-4-u-bucket" # change this 
}

variable "billing_alert_email" {
  description = "The e-mail address for receiving billing alerts"
  type        = string
  default     = "kvyatek83@gmail.com" # change this 
}

######### App Server ###########

variable "api_port" {
  description = "The port on which the app server is listening for API requests"
  type        = number
  default     = 3311
}

variable "server_admin_name" {
  description = "admin username for the server application auth"
  type        = string
  sensitive   = true
  default     = "admin" # change this 
}

variable "server_admin_role" {
  description = "admin role for the server application auth"
  type        = string
  default     = "admin" # change this 
}

variable "server_admin_password" {
  description = "admin password for the server application auth"
  type        = string
  sensitive   = true
  default     = "admin123!" # change this 
}

variable "reset_db" {
  description = "Resets the DB and inserts mocks"
  type        = bool
  default     = true 
}

variable "printer_ip" {
  description = "The IP of the printer"
  type        = string
  sensitive   = true
  default     = "192.168.68.51" # change this 
}


######### Proxy ###########

variable "website_address" {
  description = "The DNS address for the server"
  type        = string
  default     = "food4you.amsalemlab.net" # change this 
}

variable "dns_provider_api_key" {
  description = "API key used for automatic ACME challange authentication for HTTPS"
  type        = string
  sensitive   = true
  default     = "" # change this 
}
