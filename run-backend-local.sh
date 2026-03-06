#!/bin/bash

python load_config.py local
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py