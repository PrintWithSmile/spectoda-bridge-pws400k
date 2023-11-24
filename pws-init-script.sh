#!/bin/bash

# Command with a timeout of 60 seconds
timeout 60s git submodule update --init --recursive || echo "Timeout or failure in git submodule update"

# Try to run tsx
if ! tsx .; then
    echo "tsx failed, running npm install..."
    npm install
    # Try to run tsx again
    tsx .
fi