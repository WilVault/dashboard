#!/bin/bash

python load_config.py local
cd backend

# Only create venv if it doesn't exist
if [ ! -d "venv" ]; then
  python -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
python run.py