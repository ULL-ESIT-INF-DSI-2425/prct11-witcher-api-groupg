import express from "express";
import { Hunter } from "../models/hunter.model.js";

export const hunterRouter = express.Router();

/**
 * @route POST /hunters
 * @description Create a new hunter.
 * @param {Object} req.body - Hunter object to be created.
 * @returns {Object} 201 - The created hunter.
 * @returns {Object} 500 - Server error.
 */
hunterRouter.post("/hunters", async (req, res) => {
  const hunter = new Hunter(req.body);
  try {
    await hunter.save();
    res.status(201).send(hunter);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route GET /hunters
 * @description Shows the hunters given a filter by query string.
 * @param {string} [req.query.name] - Hunter name.
 * @param {string} [req.query.race] - Hunter race.
 * @param {string} [req.query.location] - Hunter location.
 * @returns {Object} 200 - The hunters found.
 * @returns {Object} 404 - Hunters not found.
 * @returns {Object} 500 - Server error.
 */
hunterRouter.get("/hunters", async (req, res) => {
  const filter_name = req.query.name ? { name: req.query.name.toString() } : {};
  const filter_race = req.query.race ? { race: req.query.race.toString() } : {};
  const filter_location = req.query.location
    ? { location: req.query.location.toString() }
    : {};
  const filter = {
    ...filter_name,
    ...filter_race,
    ...filter_location,
  };
  try {
    const hunters = await Hunter.find(filter);
    if (hunters.length === 0) {
      res.status(404).send({ error: "Hunters not found" });
    } else {
      res.status(200).send(hunters);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route GET /hunters/:id
 * @description Shows a hunter given its ID by dynamic parameter.
 * @param {string} req.params.id - Hunter ID.
 * @returns {Object} 200 - The hunter found.
 * @returns {Object} 404 - Hunter not found.
 * @returns {Object} 500 - Server error.
 */
hunterRouter.get("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findById(req.params.id);
    if (!hunter) {
      res.status(404).send({ error: "Hunter not found" });
    } else {
      res.status(200).send(hunter);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route PATCH /hunters
 * @description Updates a hunter using filters like name, type or location.
 * @param {string} req.query.name - Hunter name.
 * @param {Object} req.body - Fields to update.
 * @returns {Object} 200 - The updated hunter.
 * @returns {Object} 500 - Server error.
 * @returns {Object} 404 - Hunter not found.
 */
hunterRouter.patch("/hunters", async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: "A name must be provided in the query string",
    });
  } else {
    const allowedUpdates = ["name", "race", "location"];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update),
    );
    if (!isValidUpdate) {
      res.status(400).send({ error: "Invalid update!" });
    } else {
      try {
        const hunter = await Hunter.findOneAndUpdate(
          { name: req.query.name.toString() },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
        if (!hunter) {
          res.status(404).send({ error: "Hunter not found" });
        } else {
          res.status(200).send(hunter);
        }
      } catch (error) {
        res.status(500).send({error: error.message});
      }
    }
  }
});

/**
 * @route PATCH /hunters/:id
 * @description Updates a hunter using its ID given by dynamic parameter.
 * @param {string} req.params.id - ID of the hunter to update.
 * @param {Object} req.body - Fields to update.
 * @returns {Object} 200 - The updated hunter.
 * @returns {Object} 500 - Server error.
 * @returns {Object} 404 - Hunter not found.
 */
hunterRouter.patch("/hunters/:id", async (req, res) => {
  const allowedUpdates = ["name", "race", "location"];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidUpdate) {
    res.status(400).send({ error: "Invalid updates!" });
  } else {
    try {
      const hunter = await Hunter.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!hunter) {
        res.status(404).send({ error: "Hunter not found" });
      } else {
        res.status(200).send(hunter);
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  }
});

/**
 * @route DELETE /hunters
 * @description Deletes hunters using filters like name, type or location.
 * @param {string} [req.query.name] - Hunter name.
 * @param {string} [req.query.race] - Hunter race.
 * @param {string} [req.query.location] - Hunter location.
 * @returns {Object} 200 - The deleted hunters.
 * @returns {Object} 404 - Hunters not found.
 * @returns {Object} 500 - Server error.
 */
hunterRouter.delete("/hunters", async (req, res) => {
  const filter_name = req.query.name ? { name: req.query.name.toString() } : {};
  const filter_race = req.query.race ? { race: req.query.race.toString() } : {};
  const filter_location = req.query.location
    ? { location: req.query.location.toString() }
    : {};
  const filter = {
    ...filter_name,
    ...filter_race,
    ...filter_location,
  };
  try {
    const hunters = await Hunter.find(filter);
    if (hunters.length === 0) {
      res.status(404).send({ error: "Hunters not found" });
    } else {
      const result = await Hunter.deleteMany(filter);
      res.status(200).send({
        deletedCount: result.deletedCount,
        deletedGoods: hunters,
      });
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route DELETE /hunters/:id
 * @description Delete a hunter using its ID given by dynamic parameter.
 * @param {string} req.params.id - ID of the hunter to delete.
 * @returns {Object} 200 - The deleted hunter.
 * @returns {Object} 404 - Hunter not found.
 * @returns {Object} 500 - Server error.
 */
hunterRouter.delete("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findByIdAndDelete(req.params.id);
    if (!hunter) {
      res.status(404).send();
    } else {
      res.status(200).send(hunter);
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default hunterRouter;
