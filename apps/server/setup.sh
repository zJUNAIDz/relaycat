#!/bin/sh
# Ensure the script is executed with root privileges
if [ "$(id -u)" -ne 0 ]; then
  echo "This script must be run as root or with sudo privileges."
  exit 1
fi

# Check if Docker is installed and running
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Please install Docker and try again."
  exit 1
fi

if ! systemctl is-active --quiet docker; then
  echo "Docker is not running. Starting Docker..."
  systemctl start docker
fi
# start the docker container named "postgres18" and "minio" if it is not started already.

if docker ps -a --format '{{.Names}}' | grep -q '^postgres18$'; then
  docker start postgres18
else
  echo "Container 'postgres18' does not exist."
  docker run --name postgres18 -e POSTGRES_PASSWORD=mysecretpassword -d postgres:18
fi

if docker ps -a --format '{{.Names}}' | grep -q '^minio$'; then
  docker start minio
else
  echo "Container 'minio' does not exist."
  docker run --name minio -d minio server /data --console-address ":9001" -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin
fi