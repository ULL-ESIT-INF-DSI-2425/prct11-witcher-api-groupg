import express from "express";
import "./db/mongoose.js";
import { Good } from "../models/good.model.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/goods", (req, res) => {
  const good = new Good(req.body);
  good
    .save()
    .then((good) => {
      res.status(201).send(good);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.get("/goods", (req, res) => {
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
  Good.find(filter)
    .then((goods) => {
      if (goods.length !== 0) {
        res.send(goods);
      } else {
        res.status(404).send();
      }
    })
    .catch(() => {
      res.status(500).send();
    });
});

app.get("/goods/:id", (req, res) => {
  Good.findById(req.params.id)
    .then((good) => {
      if (!good) {
        res.status(404).send();
      } else {
        res.send(good);
      }
    })
    .catch(() => {
      res.status(500).send();
    });
});

app.patch('/goods', (req, res) => {
  if (!req.query.id) {
    res.status(400).send({
      error: 'An id must be provided in the query string',
    });
  } else if (!req.body) {
    res.status(400).send({
      error: 'Fields to be modified have to be provided in the request body',
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
      Good.findOneAndUpdate({id: req.query.id.toString()}, req.body, {
        new: true,
        runValidators: true,
      }).then((good) => {
        if (!good) {
          res.status(404).send();
        } else {
          res.send(good);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});

app.patch("/goods/:id", (req, res) => {
  const allowedUpdates = ["name", "description", "material", "weight", "value"];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
    actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: "Update is not permitted",
    });
  } else {
    Good.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .then((good) => {
        if (!good) {
          res.status(404).send();
        } else {
          res.send(good);
        }
      })
      .catch(() => {
        res.status(400).send();
      });
  }
});

app.delete("/goods", (req, res) => {
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
  Good.find(filter)
    .then((goods) => {
      if (goods.length === 0) {
        res.status(404).send({ error: "No goods found" });
      } else {
        Good.deleteMany(filter)
          .then((result) => {
            res.send({
              deletedCount: result.deletedCount,
              deletedGoods: goods,
            });
          })
          .catch(() => {
            res.status(500).send();
          });
      }
    })
    .catch(() => {
      res.status(500).send();
    });
});

app.delete("/goods/:id", (req, res) => {
  Good.findByIdAndDelete(req.params.id)
    .then((good) => {
      if (!good) {
        res.status(404).send();
      } else {
        res.send(good);
      }
    })
    .catch(() => {
      res.status(400).send();
    });
});

app.all("/{*splat}", (_, res) => {
  res.status(501).send();
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
