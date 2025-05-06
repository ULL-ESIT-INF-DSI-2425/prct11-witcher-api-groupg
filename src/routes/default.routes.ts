import express from 'express';

export const defaultRouter = express.Router();

/**
 * Estado de error por defecto
 */
defaultRouter.all('/{*splat}', (_, res) => {
  res.status(501).send();
});

export default defaultRouter;