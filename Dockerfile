FROM nvcr.io/nvidia/nightly/cuda-quantum:cu12-latest

WORKDIR /app
USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

COPY data/ ./data/
COPY src/ ./src/
COPY SKILL.md .

ENV PYTHONPATH=/app/src
RUN chmod -R 777 /app

USER cudaq
ENTRYPOINT ["/bin/bash", "-l", "-c"]
CMD ["python3 src/agents/coordinator.py"]
