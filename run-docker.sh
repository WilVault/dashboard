#!/bin/bash

python load_config.py docker

# Export frontend env vars into shell
set -a
source frontend/.env
set +a

docker compose down
docker compose build --no-cache
docker compose up -d