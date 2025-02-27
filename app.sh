#!/usr/bin/env bash

# Set environment variables if needed
export FLASK_APP=run.py
export FLASK_DEBUG=1

# Run the application
python -m flask run --host=0.0.0.0 --port=8888
