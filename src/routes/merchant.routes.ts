import express from "express";
import "./db/mongoose.js";
import { Merchant } from "../models/merchant.model.js";

export const merchantRouter = express.Router();

merchantRouter.post("/merchant", async (req, res) => {
  const merchant = new Merchant(req.body);
  try {
    await merchant.save();
    res.status(201).send(merchant);
  } catch (error) {
    res.status(400).send(error);
  }
});

merchantRouter.get("/merchant", async (req, res) => {
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
    }
    res.status(200).send(merchant);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

merchantRouter.get("/merchant/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const merchant = await Merchant.findById(_id);
    if (!merchant) {
      res.status(404).send();
    }
    res.status(200).send(merchant);
  } catch (error) {
    res.status(400).send(error);
  }
});

merchantRouter.patch("/merchant", async (req, res) => {
  if (!req.query.id) {
    res.status(400).send({
      error: 'An id must be provided in the query string',
    });
  } else {
    const allowedUpdates = ['name', 'description', 'material', 'weight', 'value'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Update is not permitted',
      });
    } else {
      try {
        const merchant = await Merchant.findOneAndUpdate(
          {
            id: req.query.id.toString()
          }, 
          req.body, 
          {
            new: true,
            runValidators: true,
          },
        );
        if (!merchant) {
          res.status(404).send();
        } else {
          res.send(merchant);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
});

merchantRouter.patch("/merchant/:id", async (req, res) => {
  const _id = req.params.id;

  const allowedUpdates = ['name', 'type', 'location'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const merchant = await Merchant.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });
    if (!merchant) {
      res.status(404).send();
    }
    res.status(200).send(merchant);
  } catch (error) {
    res.status(400).send(error);
  }
});

merchantRouter.delete("/merchant", async (req, res) => {
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
      res.status(404).send({ error: "No goods found" });
    } else {
      const result = await Merchant.deleteMany(filter);
      res.send({
        deletedCount: result.deletedCount,
        deletedGoods: merchant,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

merchantRouter.delete("/merchant/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const merchant = await Merchant.findByIdAndDelete(_id);
    if (!merchant) {
      res.status(404).send();
    }
    res.status(200).send(merchant);
  } catch (error) {
    res.status(400).send(error);
  }
});

merchantRouter.all("/merchant/{*splat}", (_, res) => {
  res.status(501).send();
});

export default merchantRouter;
