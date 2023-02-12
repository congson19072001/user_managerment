#!/bin/bash

echo "Starting create .env file"

echo DB_CONNECTION=$DB_CONNECTION >> .env
echo DB_HOST=$DB_HOST >> .env
echo DB_PORT=$DB_PORT >> .env
echo DB_USER=$DB_USER >> .env
echo DB_PASS=$DB_PASS >> .env
echo DB_NAME=$DB_NAME >> .env

echo JWT_SECRET=$JWT_SECRET >> .env
echo JWT_EXPIRED=$JWT_EXPIRED >> .env
echo JWT_REFRESH_TOKEN_EXPIRED=$JWT_REFRESH_TOKEN_EXPIRED >> .env
echo REDIS_EXPIRE_ACCESS_TOKEN=$REDIS_EXPIRE_ACCESS_TOKEN >> .env
echo REDIS_EXPIRE_REFRESH_TOKEN=$REDIS_EXPIRE_REFRESH_TOKEN >> .env

echo MAIL_HOST=$MAIL_HOST >> .env
echo MAIL_USER=$MAIL_USER >> .env
echo MAIL_PASS=$MAIL_PASS >> .env

echo SSO_ROOT_DOMAIN=$SSO_ROOT_DOMAIN >> .env
echo GAME_MARKET_FRONTEND=$GAME_MARKET_FRONTEND >> .env

echo REDIS_HOST=$REDIS_HOST >> .env
echo REDIS_PORT=$REDIS_PORT >> .env
echo REDIS_DB_CACHE=$REDIS_DB_CACHE >> .env
echo SIGNATURE_TEXT=$SIGNATURE_TEXT >> .env

echo "Finished create .env file"