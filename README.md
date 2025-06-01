# Food4You

This project is a menu for Chabad house, with order flow, charging and kichen prints.

## Development

Please create a `.env` flie in the root folder.
In the `.env`, put the next lines:

```.env
JWT_SECRET=<secret-value>
EXPIRES_IN=24h
PORT=3311
ADMIN_NAME=<your-admin-name>
ADMIN_PASSWORD=<your-admin-password>
ADMIN_ROLE=<your-admin-role>
RESET_DB=<true/false>
DB_PATH=app.db
AWS_REGION=<region>
AWS_ACCESS_KEY_ID=<your-aws-access-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_S3_BUCKET=<name-of-your-s3-bucket>
```

## Server

The server uses `NodeJS` and the `DB` is `sqlite3`, there for, to run the BE for local development, please run the command:

```bash
npm run start
```

**If you having errors about the creating tables, try the next command:**

```bash
node app.js
```

In a new terminal:

```bash
node createAdmin.js && node createTables.js
```

Now, you should have a BE running with your admin user and some mocked items.

### serve static website

You can run:

```bash
npm run build
```

Then, you can run the server and it will serve your latest changes in the frontend.

Once the server is running, open your browser and navigate to `http://localhost:3311/` or `http://localhost:<port-in-your-env>/`.

You can test the API using Curl or Postman with the suffix `/api/<tested-api>`

## Client

To start a local frontend development server, run:

```bash
npm run start:front
```

**Running the frontend with the server will give you the mocked data from the database and will save you time, you can also mock the data in the code if you need.**

Once running, open your browser and navigate to `http://localhost:12345/`. The application will automatically reload whenever you modify any of the source files.

## Deployment

To deploy the app server on AWS this project include the 'tf' directory.
In this directory there are Terraform files pre-configured to provision all the required AWS resources, which include:

* S3 bucket
* EC2 instance
* security rules for HTTP, HTTPS, SSH and the API server port
* SSH keys for remote connection
* Dedicated AWS user with permissions to access the bucket with PUT and DELETE actions
* AWS Billing alert for when the Account billing is exceeding 5 USD*
* A reverse proxy for serving the app with auto-renewing SSL certificates for HTTPS (optional, requires a privatly own domain) - read more in the next sections

Terraform will generate a `.env` file in the project root dir with the generated AWS keys.
Terraform will also automatically upload the source code ***in this project root folder*** to the provisioned VM on the cloud, set and start the NodeJS server app as a systemd service.

Once you complete a few simple steps to configure your host to be able to utilize Terraform with AWS, it will be easy to set this up with just 2 commands.

### Pre-requisites

* You should have an AWS account
* You should have admin access to this account
* You should have access and secret keys of your admin user
* You should backup any existing `.env` file you have with your own AWS credentials. Terraform will overwrite it.
* If you want to use your own domain - have an API key from your DNS provider

### Configuration

1. Set your AWS admin Access key and Secret key as environment variables:  `export AWS_ACCESS_KEY_ID='LALALA' && export AWS_SECRET_ACCESS_KEY='LILILI'`
2. Open `./tf/variables.tf` and edit the default values for *bucket_name*, *instance_name*, and *billing_alert_email*
3. Optional - change the default region of Sau-Paulo (*sa-east-1*).
    * IF you changed the default region, you need to also change the 'instance_ami' value, since its region-bound.
    The default AMI translates to Amazon Linux 2023 64-bit (x86).

### Install Terraform

For your convenience, there is the `install_terraform.sh` script in the 'tf' folder.
Open this script and use the relevant section for your operating system by uncommenting it and run the script.
The default package manager used is `brew`, even if you don't use a Mac it is recommended, but you have more options.
** The script also install `pigz` which is a parallel (multi-thread) GZIP compression library used to compress and upload the source code to the cloud VM.

### Deploy using Terraform

***WARNING - Terraform uses a special file named 'terraform.tfstate' to keep track of cloud resources that it created.***

***IF YOU RUN THE FOLLOWING COMMANDS AND LOSE THIS FILE SOMEHOW, YOU WILL HAVE TO MANUALLY DELETE ALL THESE RESOURCES MANUALLY***

*Scary part over.*

Does the command `terraform version` works on your host? does `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env-vars set?
Now run these 2 commands in the 'tf' folder:

1. `terraform init` - this will download the modules required by Terraform
2. `terraform apply` - this will provision the cloud resources and deploy the app. *you will be required to approve by entring 'yes'*, you can skip that by adding `--auto-approve` to the command.

Now watch the terminal as Terraform do all the magic, it will be done in a couple minutes.
At the end you will be presented with a custom info messages explaining to you:

* What is your public DNS entry for communicating with the API
* How to SSH into your cloud VM

### Delete the cloud resources

***Cloud resources cost money, don't keep them running for nothing***

To delete your cloud resources, run `terraform destroy --auto-approve`.
This will tear-down all the resources that were created with the apply command. (You did not delete the tfstate file right?)

## HTTPS and Proxy

### This section is relevant only if you want to use your own domain to serve the app behind HTTPS and a reverse proxy

The Terraform files include resources and script that are used to automatically set Caddy as a reverse proxy for the server app.
This is currently a WIP feature, and to make it work requires some manual steps.

You will need your own domain, and you will need access to create/change a DNS entry to point to the VM public IP.
Some DNS providers have API keys for integration with 3rd party tools like Terraform. With such API key, the creation/modification of the A record in the DNS provider registrar can be automated using Terraform.
However, since this is a somewhat custom-made solution, it is not included in this project.

But.. if you do have your own domain and able to add A records, then here's how to make this proxy work:

1. edit `./tf/scripts/proxy_setup.sh` - uncomment the `systemctl enable` line at the bottom.
2. edit `./tf/variables.tf` and update the default value of *website_address* with your custom domain
3. recreate the server by using terraform destroy and apply commands.
4. in your DNS provider management console, add an A record pointing to the public IP of the EC2 instance created by Terraform (you can get it from the printed SSH info message at the end on the output).

If everything is set properly, here's how the rest of the proccess goes:
DNS provider propagates the URL of your domain pointing to the VM public IP -> Caddy is configured to auto-generate a certificate for the given address set in the variables.tf file, it will try to do that repetedly every few minutes -> once successfull, you will be able to send API request over HTTPS to the server app via your domain address.

To check if Caddy had successfully generated a valid certificate, you can SSH into the VM, and check the status of the caddy service: `sudo systemctl status caddy.service`.

### TODO

- [ ] Automate self-signed certificate creation for Caddy reverse proxy.
- [ ] Automate DNS entry update with DNS provider API key
