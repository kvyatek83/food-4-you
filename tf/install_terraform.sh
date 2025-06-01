#!/bin/bash

# Uncomment the right part for your host 
# also install pigz for faster gzip compression

###### For Mac / brew users #######
brew tap hashicorp/tap
brew install hashicorp/tap/terraform pigz
############################


###### For RHEL users #######
# sudo yum install -y yum-utils
# sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
# sudo yum -y install terraform pigz
#############################


###### For Ubuntu/Debian users #######
# wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
# echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
# sudo apt update && sudo apt install terraform pigz
######################################

