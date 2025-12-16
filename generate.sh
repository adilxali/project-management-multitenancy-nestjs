#!/usr/bin/env bash

# Exit on error
set -e

NAME=$1

if [ -z "$NAME" ]; then
  echo "Usage: ./generate.sh <name>"
  exit 1
fi

echo "Generating NestJS module, service, and controller for: $NAME"

nest g module "$NAME"
nest g service "$NAME"
nest g controller "$NAME"

echo "Done."
