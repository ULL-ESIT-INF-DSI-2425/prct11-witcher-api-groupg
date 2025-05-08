import express from "express";
import { Merchant } from "../models/merchant.model.js";

export const merchantRouter = express.Router();

/**
 * @route POST /merchants
 * @description Create a new merchant.
 * @param {Object} req.body - Merchant object to be created.
 * @returns {Object} 201 - The created merchant.
 * @returns {Object} 500 - Server error.
 */
merchantRouter.post("/merchants", async (req, res) => {
  const merchant = new Merchant(req.body);
  try {
    await merchant.save();
    res.status(201).send(merchant);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route GET /merchants
 * @description Shows the merchants given a filter by query string.
 * @param {string} [req.query.name] - Merchant name.
 * @param {string} [req.query.type] - Merchant type.
 * @param {string} [req.query.location] - Merchant location.
 * @returns {Object} 200 - The merchants found.
 * @returns {Object} 404 - No merchants found.
 * @returns {Object} 500 - Server error.
 */
merchantRouter.get("/merchants", async (req, res) => {
  const filter_name = req.query.name ? { name: req.query.name.toString() } : {};
  const filter_type = req.query.type ? { type: req.query.type.toString() } : {};
  const filter_location = req.query.location
    ? { location: req.query.location.toString() }
    : {};
  const filter = {
    ...filter_name,
    ...filter_type,
    ...filter_location,
  };
  try {
    const merchant = await Merchant.find(filter);
    if (merchant.length === 0) {
      res.status(404).send({ error: "No merchant found" });
    } else {
      res.status(200).send(merchant);
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route GET /merchants/:id
 * @description Shows a merchant given its ID by dynamic parameter.
 * @param {string} req.params.id - Merchant ID.
 * @returns {Object} 200 - The merchant found.
 * @returns {Object} 404 - Merchant not found.
 * @returns {Object} 500 - Server error.
 */
merchantRouter.get("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      res.status(404).send({ error: "Merchant not found" });
    } else {
      res.status(200).send(merchant);
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route PATCH /merchants
 * @description Updates a merchant using filters like name, type, or location.
 * @param {string} req.query.name - Merchant name.
 * @param {Object} req.body - Fields to update.
 * @returns {Object} 200 - The updated merchant.
 * @returns {Object} 500 - Server error.
 * @returns {Object} 404 - Merchant not found.
 */
merchantRouter.patch("/merchants", async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: "A name must be provided in the query string",
    });
  } else {
    const allowedUpdates = ["name", "type", "location"];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update),
    );
    if (!isValidUpdate) {
      res.status(400).send({ error: "Invalid update!" });
    } else {
      try {
        const merchant = await Merchant.findOneAndUpdate(
          { name: req.query.name.toString() },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
        if (!merchant) {
          res.status(404).send({ error: "Merchant not found" });
        } else {
          res.status(200).send(merchant);
        }
      } catch (error) {
        res.status(500).send({error: error.message});
      }
    }
  }
});

/**
 * @route PATCH /merchants/:id
 * @description Updates a merchant using its ID given by dynamic parameter.
 * @param {string} req.params.id - Merchant ID.
 * @param {Object} req.body - Fields to update.
 * @returns {Object} 200 - The updated merchant.
 * @returns {Object} 500 - Server error.
 * @returns {Object} 404 - Merchant not found.
 */
merchantRouter.patch("/merchants/:id", async (req, res) => {
  const allowedUpdates = ["name", "type", "location"];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidUpdate) {
    res.status(400).send({ error: "Invalid updates!" });
  } else {
    try {
      const merchant = await Merchant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );
      if (!merchant) {
        res.status(404).send({ error: "Merchant not found" });
      } else {
        res.status(200).send(merchant);
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  }
});

/**
 * @route DELETE /merchants
 * @description Deletes merchants using filters like name, type, or location.
 * @param {string} [req.query.name] - Merchant name.
 * @param {string} [req.query.type] - Merchant type.
 * @param {string} [req.query.location] - Merchant location.
 * @returns {Object} 200 - The deleted merchants.
 * @returns {Object} 404 - No merchants found.
 * @returns {Object} 500 - Server error.
 */
merchantRouter.delete("/merchants", async (req, res) => {
  const filter_name = req.query.name ? { name: req.query.name.toString() } : {};
  const filter_type = req.query.type ? { type: req.query.type.toString() } : {};
  const filter_location = req.query.location
    ? { location: req.query.location.toString() }
    : {};
  const filter = {
    ...filter_name,
    ...filter_type,
    ...filter_location,
  };
  try {
    const merchant = await Merchant.find(filter);
    if (merchant.length === 0) {
      res.status(404).send({ error: "Goods not found" });
    } else {
      const result = await Merchant.deleteMany(filter);
      res.status(200).send({
        deletedCount: result.deletedCount,
        deletedGoods: merchant,
      });
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * @route DELETE /merchants/:id
 * @description Deletes a merchant using its ID given by dynamic parameter.
 * @param {string} req.params.id - Merchant ID.
 * @returns {Object} 200 - The deleted merchant.
 * @returns {Object} 404 - Merchant not found.
 * @returns {Object} 500 - Server error.
 */
merchantRouter.delete("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findByIdAndDelete(req.params.id);
    if (!merchant) {
      res.status(404).send({ error: "Merchant not found" });
    } else {
      res.status(200).send(merchant);
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default merchantRouter;
