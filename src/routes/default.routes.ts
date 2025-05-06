import express from 'express';

export const defaultRouter = express.Router();

/**
 * Route para manejar todas las rutas no definidas
 */
defaultRouter.all('/{*splat}', (_, res) => {
  res.status(501).send();
});

export default defaultRouter;