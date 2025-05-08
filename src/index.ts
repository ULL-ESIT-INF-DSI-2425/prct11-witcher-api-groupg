import { app } from './app.js';

const port = process.env.PORT || 3000;

/**
 * Main entry point for the application.
 * Starts the server and listens on the specified port.
 * @param {number} port - The port number to listen on.
 */
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

export default app;

