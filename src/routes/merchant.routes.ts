import express from 'express';
import Merchant from '../models/merchant.model.js;

export const hunterRouter = express.Router();

hunterRouter.post('/hunter', (req, res) => {
  const hunter = new Hunter(req.body);
  hunter.save(req.body).then((hunter) => {
    res.status(201).send(hunter);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

hunterRouter.get('/hunter', (req, res) => {
  const {name, type, location} = req.query;

  if (!name && !type && !location) {
    res.status(400).send({ error: 'No query parameters provided' });
  }
  const filter: Record<string, string> = {};
  if (name) {
    filter.name = name.toString();
  }
  if (type) {
    filter.type = type.toString();
  }
  if (location) {
    filter.location = location.toString();
  }
  Hunter.find(filter)
    .then((hunters) => {
      if (hunters.length !== 0) res.status(404).send({ error: 'No hunters found' });
        res.status(200).send(hunters);
    })
    .catch((error) => res.status(400).send({ error: error.message }));
});

hunterRouter.get('/hunter/:id', (req, res) => {
  const _id = req.params.id;
  Hunter.findById(_id).then((hunter) => {
    if (!hunter) {
      return res.status(404).send();
    }
    res.status(200).send(hunter);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

hunterRouter.patch('/hunter', (req, res) => {
  const {name, type, location} = req.query;
  if (!name && !type && !location) {
    res.status(400).send({ error: 'No query parameters provided' });
  }
  const filter: Record<string, string> = {};
  if (name) {
    filter.name = name.toString();
  }
  if (type) {
    filter.type = type.toString();
  }
  if (location) {
    filter.location = location.toString();
  }
  const allowedUpdates = ['name', 'type', 'location'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }
  Hunter.updateMany(filter, req.body, { new: true, runValidators: true }).then((result) => {
    if (result.matchedCount === 0) {
      res.status(404).send({ error: 'No hunters found' });
    }
    res.status(200).send({ message: 'Hunters updated successfully' });
  }).catch((error) => {
    res.status(400).send(error);
  });
});

hunterRouter.patch('/hunter/:id', (req, res) => {
  const _id = req.params.id;
  const allowedUpdates = ['name', 'type', 'location'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }

  Hunter.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true }).then((hunter) => {
    if (!hunter) {
      res.status(404).send();
    }
    res.status(200).send(hunter);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

hunterRouter.delete('/hunter', (req, res) => {
  const {name, type, location} = req.query;
  if (!name && !type && !location) {
    res.status(400).send({ error: 'No query parameters provided' });
  }
  const filter: Record<string, string> = {};
  if (name) {
    filter.name = name.toString();
  }
  if (type) {
    filter.type = type.toString();
  }
  if (location) {
    filter.location = location.toString();
  }
  Hunter.deleteMany(filter).then((result) => {
    if (result.deletedCount === 0) {
      res.status(404).send({ error: 'No hunters found' });
    }
    res.status(200).send({ message: 'Hunters deleted successfully' });
  }).catch((error) => {
    res.status(400).send(error);
  });
});

hunterRouter.delete('/hunter/:id', (req, res) => {
  const _id = req.params.id;
  Hunter.findByIdAndDelete(_id).then((hunter) => {
    if (!hunter) {
      return res.status(404).send();
    }
    res.status(200).send(hunter);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

hunterRouter.all('/hunter/{*splat}', (_, res) => {
  res.status(501).send();
});


export default hunterRouter;