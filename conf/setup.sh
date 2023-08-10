
#Install Software Packages
sudo yum install -y openssl
sudo yum install -y nginx

#Create Certificates
sudo mkdir /etc/nginx/ssl/
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt -subj "/C=US/ST=US/L=US/O=Global Security/OU=IT Department/CN=127.0.0.1"

#Copy Configurations
sudo cp conf/api.core.service /usr/lib/systemd/system/api.core.service
sudo cp conf/server.conf /etc/nginx/conf.d/

#Enable Auto-Start
sudo chkconfig nginx on
sudo chkconfig api.core on


#Change permissions
sudo chown -R ec2-user:ec2-user /aws/apps

#NodeJS Installation
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh --output install.sh
sh install.sh
. ~/.nvm/nvm.sh
nvm install 16.17

#NodeJS API Core Installation
cd /aws/apps/server/; npm install;


#React Application Installation
cd /aws/apps/frontend/; npm install; npm run build;

#Copy aws-exports
cp /aws/apps/conf/aws-exports.json /aws/apps/frontend/build/
cp /aws/apps/conf/aws-exports.json /aws/apps/server/


#Restart the services
sudo service nginx restart
sudo service api.core restart




