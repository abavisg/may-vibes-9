# may-vibes-9
A project for AI-powered vibes.

This project is a web application with a React frontend and an Express.js backend. It uses Drizzle ORM with a local PostgreSQL database and integrates with Ollama for AI functionalities.

---

## Features

- **Generate Learning Cards** – AI-powered generation of educational cards using Ollama.
- **Save Courses** – Allows saving course information for later access.
- **Retrieve Courses** – Fetch saved courses, potentially filtered by user ID.
- **Course Progress Tracking** – Track and update the current position in a course.
- **User Authentication** - (Inferred from Passport dependency)
- **Database Integration** - Using Drizzle ORM with local PostgreSQL

---

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Radix UI, React Query, Wouter
- **Backend:** Express.js, TypeScript, Drizzle ORM, **Local PostgreSQL database**, Ollama, Passport
- **Other:** WebSockets (`ws`), Zod for validation

---

## Architecture
The project follows a client-server architecture. The client is a React application that communicates with the Express.js backend. The backend handles API requests, interacts with the database (local PostgreSQL via Drizzle ORM), and communicates with Ollama for AI-powered card generation.

---

## API Endpoints
- `POST /api/generate-cards` - Generates learning cards using Ollama.
- `POST /api/save-course` - Saves course information.
- `GET /api/courses/:userId?` - Retrieves courses, optionally filtered by user ID.
- `GET /api/course/:id` - Retrieves a specific course by its ID.
- `POST /api/course/:id/progress` - Updates course progress.

---

## Implementation Status and Remaining Work

**Implemented:**
- Core backend API endpoints for card generation, saving courses, retrieving courses, and updating course progress.
- Basic database connection configured for local PostgreSQL.
- Client-side hooks and API calls for card generation, saving/fetching courses, and updating course progress.
- Basic client-side screen management and components for displaying cards.
- Loading indicators during card generation for better user experience.
- Robust JSON parsing for Ollama responses.

**Remaining Work:**
- **Complete Client-side User Interface:** Build out all necessary pages and components for a full user experience, including dedicated views for saved courses, a complete authentication flow (signup, login, logout), and any other planned features.
- **User Authentication and Authorization:** Implement secure user authentication on the backend and integrate authentication status and token handling on the client-side to protect routes and data.
- **Refinement of Backend Logic:** Review and enhance the details of database interactions (`server/storage.ts`) and AI integration (`server/ollama.ts`) for completeness, error handling, and robustness. Ensure Ollama is configured correctly (e.g., via `OLLAMA_HOST` environment variable if not using default).
- **Comprehensive Client-side State Management:** Improve state management for global application state, user authentication, and complex data flows.
- **Enhanced Error Handling and User Feedback:** Implement more detailed and user-friendly error handling and notifications throughout the application.
- **Real-time Features (if planned):** Implement WebSocket communication on both the server and client if real-time functionality is part of the project scope.

---

## Setup the application

1.  **Clone the repository:**
    ```bash
    git clone [repository_url]
    cd may-vibes-9
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up a local PostgreSQL database:**
    Install and start a local PostgreSQL server if you don't have one. Create a new database for the project.
4.  **Set up environment variables:**
    Create a `.env` file in the root directory and add necessary environment variables. Ensure you set the `DATABASE_URL` environment variable with the connection string for your local PostgreSQL database (e.g., `postgresql://[user]:[password]@localhost:5432/[database_name]`).
5.  **Run database migrations:**
    ```bash
    npm run db:push
    ```
6.  **Set up Ollama:**
    Ensure Ollama is installed and the `llama3` model is available. You can configure the Ollama host with the `OLLAMA_HOST` environment variable if not using the default.

---

## Run the application

-   **Development:**
    ```bash
    npm run dev
    ```
    This will start the client and server in development mode using Vite and tsx.
-   **Build:**
    ```bash
    npm run build
    ```
    This will build the client and server for production.
-   **Start:**
    ```bash
    npm run start
    ```
    This will start the production server.
-   **Type Check:**
    ```bash
    npm run check
    ```

---

## License
MIT

