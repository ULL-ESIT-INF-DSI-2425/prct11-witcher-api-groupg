import express from "express";

export const defaultRouter = express.Router();

/**
 * @route ALL /{*splat}
 * @description Deal with all unmatched routes.
 * @param {string} splat - The unmatched route.
 * @returns {Object} 501 - Not Implemented.
 */
defaultRouter.all("/{*splat}", (_, res) => {
  res.status(501).send({
    error: "Not Implemented",
    message: "The requested route is not implemented.",
  });
});

export default defaultRouter;
