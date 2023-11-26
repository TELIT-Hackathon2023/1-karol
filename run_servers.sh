#!/bin/bash

# Command to start Express server
echo "Starting Express server..."
cd caniuse_express_server && node app.js &

# Command to start FastAPI server (assuming it's in a separate Python file)
echo "Starting FastAPI server..."
python -m uvicorn main:app  --host 0.0.0.0 --port 8000 --reload