import express from "express";
import "./db/mongoose.js";
import { Good } from "../models/good.model.js";

const goodRouter = express.Router();

goodRouter.post("/goods", async (req, res) => {
  const good = new Good(req.body);
  try {
    await good.save();
    res.status(201).send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

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
      res.send(goods);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

goodRouter.get("/goods/:id", async (req, res) => {
  const goodId = req.params.id;
  try {
    const good = await Good.findById(goodId);
    if (!good) {
      res.status(404).send();
    }
    res.status(200).send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

goodRouter.patch('/goods', async (req, res) => {
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
        const good = await Good.findOneAndUpdate(
          {
            id: req.query.id.toString()
          }, 
          req.body, 
          {
            new: true,
            runValidators: true,
          },
        );
        if (!good) {
          res.status(404).send();
        } else {
          res.send(good);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
});

goodRouter.patch("/goods/:id", async (req, res) => {
  const allowedUpdates = ["name", "description", "material", "weight", "value"];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
    actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: "Update is not permitted",
    });
  } else {
    try {
      const good = await Good.findOneAndUpdate(
        {
          id: req.params.id.toString(),
        }, 
        req.body, 
        {
          new: true,
          runValidators: true,
        },
      );
      if (!good) {
        res.status(404).send();
      } else {
        res.send(good);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
});

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
      res.status(404).send({ error: "No goods found" });
    } else {
      const result = await Good.deleteMany(filter);
      res.send({
        deletedCount: result.deletedCount,
        deletedGoods: goods,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

goodRouter.delete("/goods/:id", async (req, res) => {
  try { 
    const good = await Good.findByIdAndDelete(req.params.id);
    if (!good) {
      res.status(404).send();
    } else {
      res.send(good);
    }
  } catch (error) {
    res.status(400).send();
  }
});

export default goodRouter;