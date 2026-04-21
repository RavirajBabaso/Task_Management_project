#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."
docker compose exec backend npx sequelize-cli db:migrate
