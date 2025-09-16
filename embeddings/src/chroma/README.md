## Setup ChromaDB with Docker

1. **Pull the ChromaDB Docker image and run the container**

   ```bash
   docker pull chromadb/chroma:latest
   docker run -p 8000:8000 chromadb/chroma:latest
   ```

   This will start ChromaDB and make it available at:  
   [http://localhost:8000](http://localhost:8000)
