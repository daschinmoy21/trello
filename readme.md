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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
