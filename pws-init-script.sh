#!/bin/bash

# Define the root directory of your main Git repository
REPO_DIR="/home/pi/spectoda-bridge-pws400k"

# Submodules paths
SUBMODULES=("src/lib/node-ble" "src/lib/spectoda-js")

# Navigate to the root directory
cd $REPO_DIR

timeout 60s git submodule update --init --recursive || true

# Loop through each submodule and reset it
for SUBMODULE in "${SUBMODULES[@]}"
do
    echo "Resetting $SUBMODULE"
    cd $SUBMODULE

    # Resetting the submodule
    git reset --hard

    # Navigate back to the root directory
    cd $REPO_DIR
done

# Try to run tsx
if ! tsx .; then
    echo "tsx failed, running npm install..."
    npm install

    # Try to run tsx again
    tsx .
fi
