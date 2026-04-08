#!/bin/bash
# Syncs cosmo_images from Box (MacBook) → Lola
# Run this after adding new images to Box

rsync -avz --delete \
  "/Users/villanueva/Library/CloudStorage/Box-Box/Ops/Own/cosmo web/cosmo_images/" \
  "villanoeva@lola:/home/villanoeva/cosmo_images/"

echo "Sync complete."
