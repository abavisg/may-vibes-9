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
The project follows a client-server architecture with separated development environments:

- **Client**: A React application built with Vite, running on port 5173
- **Server**: An Express.js backend running on port 8080 that handles API requests, database interactions, and AI functionality
- **API Communication**: The client communicates with the server via HTTP requests with proper CORS configuration
- **Database**: Local PostgreSQL database accessed via Drizzle ORM
- **AI Integration**: Ollama for AI-powered card generation

This architecture allows for independent development and deployment of the client and server components while maintaining efficient communication between them.

---

## API Endpoints
- `POST /api/generate-cards` - Generates learning cards using Ollama.
- `POST /api/save-course` - Saves course information.
- `GET /api/courses/:userId?` - Retrieves courses, optionally filtered by user ID.
- `GET /api/course/:id` - Retrieves a specific course by its ID.
- `POST /api/course/:id/progress` - Updates course progress.

---

## Implementation Status and Achievements

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

**Recent Improvements:**
- **Separated Client-Server Development**: Configured independent client and server with proper port management
- **Fixed MIME Type Errors**: Implemented standalone Vite server solution to prevent browser MIME type conflicts
- **Resolved React Rendering Issues**: Fixed infinite re-rendering loops in CourseCardsView component
- **Enhanced Data Prefetching**: Implemented React Query pre-caching for smoother transitions between views
- **Improved Cache Management**: Added robust validation and fallback mechanisms for cache integrity
- **Fixed Navigation Flow**: Added consistent navigation elements across all views
- **Performance Optimization**: Reduced unnecessary re-renders with React.memo and proper dependency management
- **Mobile-Friendly UI**: Improved layout and navigation for better mobile experience
- **Consistent Error Handling**: Added comprehensive error boundaries and user-friendly messages

**Remaining Work:**
- **User Authentication and Authorization:** Implement secure user authentication on the backend and integrate authentication status and token handling on the client-side to protect routes and data.
- **Refinement of Backend Logic:** Review and enhance the details of database interactions (`server/storage.ts`) for completeness, error handling, and robustness.
- **Enhanced Error Handling and User Feedback:** Implement more detailed and user-friendly error handling and notifications throughout the application.
- **Real-time Features (if planned):** Implement WebSocket communication on both the server and client if real-time functionality is part of the project scope.
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
    This starts both the client (on port 5173) and server (on port 8080) in development mode.
    
    The client and server can also be started independently:
    ```bash
    # Start only the client
    npm run dev:client
    
    # Start only the server
    npm run dev:server
    ```

-   **Build:**
    ```bash
    npm run build
    ```
    This will build both the client and server for production.

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

## Troubleshooting

- **MIME Type Errors**: If you encounter MIME type errors in the browser, ensure you're using the client URL (port 5173) for development, not the server port.
- **React Query Cache Issues**: If course data isn't loading properly, try clearing your browser cache or implementing a forced refresh.
- **API Connection Errors**: Make sure both client and server are running, and CORS is properly configured in development.

---

## License
MIT

