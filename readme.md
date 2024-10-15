# Trello Clone Project

This project is a Trello-like application with the following features:
- User authentication
- Shared workspaces visible only to allowed users
- Shared Kanban boards
- Real-time updating to-do lists
- Board chat functionality

## Tech Stack
- Database: PostgreSQL
- Backend: Python with FastAPI
- Frontend: React
- Real-time updates: WebSockets (Socket.IO)
- Containerization: Docker

## Prerequisites
- Docker
- Docker Compose

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/your-username/trello-clone.git
   cd trello-clone
   ```

2. Create a `.env` file in the project root with the following content:
   ```
   POSTGRES_DB=trello_test
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=demos
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

3. Build and start the Docker containers:
   ```
   docker-compose up --build
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

To run the application in development mode:

1. Start the containers:
   ```
   docker-compose up
   ```

2. The frontend and backend will automatically reload when you make changes to the code.

## Testing

To run tests:

1. For the backend:
   ```
   docker-compose run backend pytest
   ```

2. For the frontend:
   ```
   docker-compose run frontend npm test
   ```

## Troubleshooting

- If you encounter any issues, try stopping the containers and rebuilding:
  ```
  docker-compose down
  docker-compose up --build
  ```

- To view logs:
  ```
  docker-compose logs
  ```

- If `docker-compose` command is not recognized, try using:
  ```
  docker compose up --build
  ```

- Ensure Docker and Docker Compose are properly installed:
  ```
  docker --version
  docker compose version
  ```

- If you see an error like "Cannot connect to the Docker daemon", make sure the Docker daemon is running:
  - On Linux, you can start the Docker daemon with:
    ```
    sudo systemctl start docker
    ```
  - On Windows or macOS, ensure that Docker Desktop is running.

- If you're using Linux and get a permission denied error, you may need to add your user to the docker group:
  ```
  sudo usermod -aG docker $USER
  ```
  Then log out and log back in for the changes to take effect.

- The warning about the `version` attribute being obsolete in the docker-compose.yml file can be resolved by removing the `version` line from your docker-compose.yml file. This won't affect functionality.

- If problems persist, consider reinstalling Docker from the official website: https://www.docker.com/products/docker-desktop

- If you encounter an error during the build process, particularly with the frontend container, try the following:

  1. Ensure you have the correct version of Node.js installed (check the version in the frontend Dockerfile):
     ```
     node --version
     ```

  2. Clean your npm cache:
     ```
     npm cache clean --force
     ```

  3. Remove the node_modules directory and package-lock.json file from your frontend directory, then reinstall dependencies:
     ```
     cd frontend
     rm -rf node_modules package-lock.json
     npm install
     ```

  4. If the issue persists, try building the frontend locally to see if there are any specific errors:
     ```
     cd frontend
     npm run build
     ```

- If you're still encountering issues, please check the logs of the frontend container:
  ```
  docker-compose logs frontend
  ```
  This may provide more detailed information about what's going wrong during the build process.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
