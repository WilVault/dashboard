#!/bin/bash

python load_config.py local
cd frontend
npm install
npm run dev