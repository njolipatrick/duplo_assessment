#!/bin/bash
sudo docker stop $(sudo docker ps -aq)
sudo docker rm $(sudo docker ps -aq)
sudo docker rmi $(sudo docker images -q)
sudo docker volume rm $(sudo docker volume ls -q)
sudo docker rm $(sudo docker ps -a -q)
sudo docker image prune -f
sudo docker buildx prune -f
sudo docker network prune -f
sudo docker system prune -af

