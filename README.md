# may-vibes-9
A project for AI-powered vibes.

This project is a web application with a React frontend and an Express.js backend. It uses Drizzle ORM with a local PostgreSQL database and integrates with Ollama for AI functionalities.

---

## Features

- **Generate Learning Cards** – AI-powered generation of educational cards using Ollama.
- **My Courses** – Allows saving course information and tracking progress. Tapping a course navigates directly to the learning cards view.
- **Retrieved Courses** – Fetch my courses, potentially filtered by user ID.
- **Course Progress Tracking** – Track and update the current position in a course.
- **Integrated Resume & Start Functionality** – Resume from where you left off or start from the beginning, directly from the learning cards view if saved progress exists.
- **Daily Learning Mode** – Schedule cards for daily review.
- **Age-Appropriate Content** – Customized learning material for different age groups.
- **Text-to-Speech** – Read cards aloud for better accessibility.
- **Export Options** – Download or print courses for offline use.
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
- Client-side hooks and API calls for card generation, fetching courses, and updating course progress.
- Learning Card View UI with next/previous navigation, progress indicators, and save functionality.
- Loading indicators during card generation for better user experience.
- Robust JSON parsing for Ollama responses with fallback mechanisms.
- Configurable Ollama integration with environment variables for host and model.
- Request timeout handling and retry mechanism for Ollama calls.
- Text-to-speech functionality for reading cards aloud.
- Unified course management with integrated save, resume, and restart functionality directly within the card view.
- Fixed navigation between card views and parent views.
- Age-appropriate content styling and customization.
- Daily learning mode for scheduled card review.
- Export functionality for downloading or printing courses.
- Modular codebase with clear separation of concerns and routing.
- Parent mode accessible via the /parent route.

**Remaining Work:**
- **User Authentication and Authorization:** Implement secure user authentication on the backend and integrate authentication status and token handling on the client-side to protect routes and data.
- **Refinement of Backend Logic:** Review and enhance the details of database interactions (`server/storage.ts`) for completeness, error handling, and robustness.
- **Enhanced Error Handling and User Feedback:** Implement more detailed and user-friendly error handling and notifications throughout the application.
- **Real-time Features (if planned):** Implement WebSocket communication on both the server and client if real-time functionality is part of the project scope.
- **Mobile Responsiveness:** Further optimize the UI for smaller screens and touch interactions.
- **Offline Support:** Implement service workers for offline functionality.
- **Analytics and Tracking:** Add usage analytics to understand user learning patterns.

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
    Create a `.env` file in the root directory and add necessary environment variables:
    ```bash
    # Database configuration
    DATABASE_URL=postgresql://[user]:[password]@localhost:5432/[database_name]
    
    # Ollama configuration
    OLLAMA_HOST=http://localhost:11434
    OLLAMA_MODEL=tinyllama
    OLLAMA_TIMEOUT=30000
    ```
5.  **Run database migrations:**
    ```bash
    npm run db:push
    ```
6.  **Set up Ollama:**
    Ensure Ollama is installed and the model specified in `OLLAMA_MODEL` is available (default is 'tinyllama').
    ```bash
    # Install the model if not already available
    ollama pull tinyllama
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

