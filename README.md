# GameCraft AI Agent System

A production-quality agentic AI system designed to transform ambiguous natural-language descriptions into fully playable browser games.

## Architecture

The system employs a multi-agent orchestration pattern:

1.  **Clarifier Agent**: Analyzes the initial prompt for ambiguity. It uses a recursive loop to ask the user targeted questions until the game mechanics are sufficiently defined.
2.  **Planner Agent**: Takes the clarified requirements and produces a structured technical specification, including state management, rendering strategies, and control schemes.
3.  **Builder Agent**: Implements the plan into clean, modular HTML5/CSS3/JavaScript code. It can target Vanilla JS or Phaser.js.
4.  **Orchestrator**: Manages the state machine, logging, and validation. It ensures that the output of one agent correctly feeds into the next and handles retries if validation fails.

## Design Decisions

-   **Frontend-First LLM Calls**: To comply with performance and security guidelines, all Gemini API calls are handled via the `@google/genai` SDK in the client.
-   **Structured JSON Outputs**: Every agent communicates using strict JSON schemas to ensure reliability and ease of parsing.
-   **Phaser.js Support**: The system can dynamically decide to use Phaser.js for complex physics or Vanilla Canvas for lightweight games.
-   **Real-time Logging**: A dedicated logging system provides visibility into the "thought process" of each agent.

## Setup Instructions

### Local Development

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set your `GEMINI_API_KEY` in a `.env` file.
4.  Start the development server:
    ```bash
    npm run dev
    ```

### Docker

To run the system in a containerized environment:

```bash
docker build -t game-agent .
docker run -it -p 3000:3000 game-agent
```

## Future Improvements

-   **Asset Generation**: Integrate with image generation models to create custom sprites.
-   **Self-Correction**: Implement a "Tester Agent" that runs the code in a headless environment to catch runtime errors.
-   **Multi-File Projects**: Support more complex directory structures for larger games.
