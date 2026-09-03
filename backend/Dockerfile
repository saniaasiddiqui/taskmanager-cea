# FROM chooses the small official Python base image used by the backend container.
FROM python:3.13-slim

# WORKDIR makes /app the directory used by later COPY, RUN, and CMD instructions.
WORKDIR /app

# COPY first adds only dependencies, which lets Docker reuse the install layer.
COPY requirements.txt .

# RUN installs the Python packages while the image is being built.
RUN pip install --no-cache-dir -r requirements.txt

# COPY adds the application source code to the image.
COPY app ./app

# EXPOSE documents the port Uvicorn listens on; Compose publishes it to the host.
EXPOSE 8000

# CMD starts FastAPI and listens on all container network interfaces.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
