#!/bin/sh
set -e

cd /var/www/html

# Secrets come from the environment (docker-compose / .env). Missing secrets
# are a hard error, unless ALLOW_EPHEMERAL_SECRETS=true (local try-out only):
# then throwaway values are generated and every token and encrypted value is
# lost on each container restart.
if [ -z "$APP_KEY" ] || [ -z "$JWT_SECRET" ]; then
    if [ "${ALLOW_EPHEMERAL_SECRETS:-false}" != "true" ]; then
        echo "entrypoint: APP_KEY and JWT_SECRET must be set (or ALLOW_EPHEMERAL_SECRETS=true for a local try-out)." >&2
        exit 1
    fi
fi

if [ -z "$APP_KEY" ]; then
    APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
    export APP_KEY
    echo "entrypoint: APP_KEY is not set, generated a temporary one (set it in .env)." >&2
fi

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="$(php -r 'echo bin2hex(random_bytes(32));')"
    export JWT_SECRET
    echo "entrypoint: JWT_SECRET is not set, generated a temporary one (set it in .env)." >&2
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    # The database container may accept TCP before it accepts logins.
    tries=0
    until php artisan migrate --force --no-interaction; do
        tries=$((tries + 1))
        if [ "$tries" -ge "${MIGRATE_RETRIES:-10}" ]; then
            echo "entrypoint: migrations failed after $tries attempts." >&2
            exit 1
        fi
        echo "entrypoint: database not ready, retrying in 3s ($tries)..." >&2
        sleep 3
    done
fi

php artisan optimize

chown -R www-data:www-data storage bootstrap/cache

exec "$@"
