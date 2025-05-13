# may-vibes-9
A project for AI-powered vibes.

This project is a web application with a React frontend and an Express.js backend. It uses Drizzle ORM with a Neon database and integrates with OpenAI and Ollama for AI functionalities.

---

## Features

- **Generate Cards** – Functionality to generate cards, likely using AI.
- **Save Course** – Allows saving course information.
- **Retrieve Courses** – Fetch courses, potentially filtered by user ID.
- **Retrieve Course by ID** – Fetch a specific course by its ID.
- **User Authentication** - (Inferred from Passport dependency)
- **Database Integration** - (Using Drizzle ORM with Neon)

---

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Radix UI, React Query, Wouter
- **Backend:** Express.js, TypeScript, Drizzle ORM, Neon database, OpenAI, Ollama, Passport
- **Other:** WebSockets (`ws`), Zod for validation

---

## Architecture
The project follows a client-server architecture. The client is a React application that communicates with the Express.js backend. The backend handles API requests, interacts with the database (Neon via Drizzle ORM), and communicates with external AI services (OpenAI, Ollama).

---

## API Endpoints
- `POST /api/generate-cards` - Generates cards.
- `POST /api/save-course` - Saves course information.
- `GET /api/courses/:userId?` - Retrieves courses, optionally filtered by user ID.
- `GET /api/course/:id` - Retrieves a specific course by its ID.
- `POST /api/course/:id/progress` - Updates course progress.

---

## Implementation Status and Remaining Work

**Implemented (Core API Endpoints):**
- Basic server-side implementations for generating cards, saving courses, retrieving courses, retrieving a single course, and updating course progress are in place.
- Request validation is included for relevant endpoints.

**Remaining Work:**
- **Client-side Implementation:** Building the full user interface and connecting it to the backend APIs is the major remaining task. This includes creating pages and components for:
    - Generating learning cards and displaying results.
    - Viewing lists of saved courses.
    - Viewing the details of a specific course and interacting with learning cards.
    - Tracking and displaying course progress.
    - Implementing client-side state management and error handling.
- **User Authentication and Authorization:** Implementing secure user login, signup, and protecting relevant API endpoints and client-side routes based on user authentication status.
- **Refinement of Backend Logic:** Reviewing and potentially enhancing the implementation within `server/storage.ts` (database interactions) and `server/openai.ts` (AI integrations) for completeness, error handling, and edge cases.
- **Additional Features:** Implementing any further planned features that require new API endpoints or significant client-side development.
- **Real-time Features (if planned):** Implementing WebSocket communication on both the server and client if real-time functionality is intended.

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
3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add necessary environment variables. Ensure you set the `DATABASE_URL` environment variable with the connection string for your Neon database.
4.  **Provision the database:**
    Before running migrations, ensure your database is provisioned (e.g., created in Neon).
5.  **Run database migrations:**
    ```bash
    npm run db:push
    ```

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

