# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
# This copies everything from your local 'backend' folder to '/app' in the container
COPY . .

# Command to run your app
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]