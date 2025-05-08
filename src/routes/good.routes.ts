import express from "express";
import { Good } from "../models/good.model.js";

const goodRouter = express.Router();

/**
 * @route POST /goods
 * @description Create a new good.
 * @param {Object} req.body - Good object to be created.
 * @returns {Object} 201 - The created good.
 * @returns {Object} 500 - Server error.
 */
goodRouter.post("/goods", async (req, res) => {
  const good = new Good(req.body);
  try {
    await good.save();
    res.status(201).send(good);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route GET /goods
 * @description Shows the goods given a filter by query string.
 * @param {string} [req.query.name] - Good name.
 * @param {string} [req.query.description] - Good description.
 * @param {string} [req.query.material] - Good material.
 * @returns {Object} 200 - The goods found.
 * @returns {Object} 404 - Goods not found.
 * @returns {Object} 500 - Server error.
 */
goodRouter.get("/goods", async (req, res) => {
  const filter_name = req.query.name ? { name: req.query.name.toString() } : {};
  const filter_description = req.query.description
    ? { description: req.query.description.toString() }
    : {};
  const filter_material = req.query.material
    ? { material: req.query.material.toString() }
    : {};
  const filter = {
    ...filter_name,
    ...filter_description,
    ...filter_material,
  };
  try {
    const goods = await Good.find(filter);
    if (goods.length !== 0) {
      res.status(200).send(goods);
    } else {
      res.status(404).send({ error: "Goods not found" });
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route GET /goods/:id
 * @description Shows a good given its ID by dynamic parameter.
 * @param {string} req.params.id - Good ID.
 * @returns {Object} 200 - The good found.
 * @returns {Object} 404 - Good not found.
 * @returns {Object} 500 - Server error.
 */
goodRouter.get("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findById(req.params.id);
    if (!good) {
      res.status(404).send({ error: "Good not found" });
    } else {
      res.status(200).send(good);
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route PATCH /goods
 * @description Updates a good using filters like name, description or material.
 * @param {string} req.query.name - Name of the good to update.
 * @param {Object} req.body - Fields to update.
 * @returns {Object} 200 - The updated good.
 * @returns {Object} 400 - Error in the request (invalid update).
 * @returns {Object} 404 - Good not found.
 * @returns {Object} 500 - Server error.
 */
goodRouter.patch("/goods", async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: "A name must be provided in the query string",
    });
  } else {
    const allowedUpdates = [
      "name",
      "description",
      "material",
      "weight",
      "stock",
      "value",
    ];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update),
    );
    if (!isValidUpdate) {
      res.status(400).send({ error: "Invalid update!" });
    } else {
      try {
        const good = await Good.findOneAndUpdate(
          { name: req.query.name.toString() },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
        if (!good) {
          res.status(404).send({ error: "Good not found" });
        } else {
          res.status(200).send(good);
        }
      } catch (error) {
        res.status(500).send({error: error.message});
      }
    }
  }
});

/**
 * @route PATCH /goods/:id
 * @description Updates a good using its ID given by dynamic parameter.
 * @param {string} req.params.id - ID of the good to update.
 * @param {Object} req.body - Fields to update.
 * @returns {Object} 200 - The updated good.
 * @returns {Object} 400 - Error in the request (invalid update).
 * @returns {Object} 404 - Good not found.
 * @returns {Object} 500 - Server error.
 */
goodRouter.patch("/goods/:id", async (req, res) => {
  const allowedUpdates = [
    "name",
    "description",
    "material",
    "weight",
    "stock",
    "value",
  ];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidUpdate) {
    res.status(400).send({ error: "Invalid update!" });
  } else {
    try {
      const good = await Good.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!good) {
        res.status(404).send({ error: "Good not found" });
      } else {
        res.status(200).send(good);
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  }
});

/**
 * @route DELETE /goods
 * @description Deletes goods using filters like name, description or material given by query string.
 * @param {string} [req.query.name] - Good name.
 * @param {string} [req.query.description] - Good description.
 * @param {string} [req.query.material] - Good material.
 * @returns {Object} 200 - The goods deleted.
 * @returns {Object} 404 - Goods not found.
 * @returns {Object} 500 - Server error.
 */
goodRouter.delete("/goods", async (req, res) => {
  const filter_name = req.query.name ? { name: req.query.name.toString() } : {};
  const filter_description = req.query.description
    ? { description: req.query.description.toString() }
    : {};
  const filter_material = req.query.material
    ? { material: req.query.material.toString() }
    : {};
  const filter = {
    ...filter_name,
    ...filter_description,
    ...filter_material,
  };
  try {
    const goods = await Good.find(filter);
    if (goods.length === 0) {
      res.status(404).send({ error: "Goods not found" });
    } else {
      const result = await Good.deleteMany(filter);
      res.status(200).send({
        deletedCount: result.deletedCount,
        deletedGoods: goods,
      });
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route DELETE /goods/:id
 * @description Deletes a good using its ID given by dynamic parameter.
 * @param {string} req.params.id - ID of the good to delete.
 * @returns {Object} 200 - The deleted good.
 * @returns {Object} 404 - Good not found.
 * @returns {Object} 500 - Server error.
 */
goodRouter.delete("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findByIdAndDelete(req.params.id);
    if (!good) {
      res.status(404).send({ error: "Good not found" });
    } else {
      res.status(200).send(good);
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default goodRouter;
