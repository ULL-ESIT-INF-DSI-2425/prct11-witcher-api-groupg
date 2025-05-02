import express from "express";
import { Hunter } from "../models/hunter.model.js";

export const hunterRouter = express.Router();

hunterRouter.post("/hunter", async (req, res) => {
  const hunter = new Hunter(req.body);

  try {
    await hunter.save();
    res.status(201).send(hunter);
  } catch (error) {
    res.status(400).send(error);
  }
});

hunterRouter.get("/hunter", async (req, res) => {
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
    const hunters = await Hunter.find(filter);
    if (hunters.length === 0) {
      res.status(404).send({ error: "No hunters found" });
    }
    res.status(200).send(hunters);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

hunterRouter.get("/hunter/:id", async (req, res) => {
  const hunterid = req.params.id;
  try {
    const hunter = await Hunter.findById(hunterid);
    if (!hunter) {
      res.status(404).send();
    }
    res.status(200).send(hunter);
  } catch (error) {
    res.status(400).send(error);
  }
});

hunterRouter.patch("/hunter", async (req, res) => {
  if (!req.query.id) {
    res.status(400).send({
      error: "An id must be provided in the query string",
    });
  } else {
    const allowedUpdates = ["name", "type", "location"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      res.status(400).send({ error: "Invalid updates!" });
    } else {
      try {
        const hunter = await Hunter.findOneAndUpdate(
          {
            id: req.query.id.toString(),
          },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
        if (!hunter) {
          res.status(404).send();
        } else {
          res.send(hunter);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
});

hunterRouter.patch("/hunter/:id", async (req, res) => {
  const allowedUpdates = ["name", "type", "location"];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    res.status(400).send({ error: "Invalid updates!" });
  } else {
    try {
      const hunter = await Hunter.findOneAndUpdate(
        {
          id: req.params.id.toString(),
        },
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );
      if (!hunter) {
        res.status(404).send();
      } else {
        res.send(hunter);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
});

hunterRouter.delete("/hunter", async (req, res) => {
  const filter_name = req.query.name ? { name: req.query.name.toString() } : {};
  const filter_type = req.query.type
    ? { type: req.query.type.toString() }
    : {};
  const filter_location = req.query.location
    ? { location: req.query.location.toString() }
    : {};
  const filter = {
    ...filter_name,
    ...filter_type,
    ...filter_location,
  };

  try {
    const hunters = await Hunter.find(filter);
    if (hunters.length === 0) {
      res.status(404).send({ error: "No hunters found" });
    } else {
      const result = await Hunter.deleteMany(filter);
      res.send({
        deletedCount: result.deletedCount,
        deletedGoods: hunters,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.delete("/hunter/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const hunter = await Hunter.findByIdAndDelete(_id);
    if (!hunter) {
      res.status(404).send();
    }
    res.status(200).send(hunter);
  } catch (error) {
    res.status(400).send(error);
  }
});

export default hunterRouter;
