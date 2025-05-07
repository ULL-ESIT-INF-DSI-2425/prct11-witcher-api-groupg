import express from "express";
import { Hunter } from "../models/hunter.model.js";

export const hunterRouter = express.Router();

/**
 * @route POST /hunter
 * @description Crea un nuevo cazador.
 * @access Public
 * @param {Object} req.body - Datos del cazador a crear.
 * @returns {Object} 201 - El cazador creado.
 * @returns {Object} 400 - Error en la solicitud.
 */
hunterRouter.post("/hunter", async (req, res) => {
  const hunter = new Hunter(req.body);
  try {
    await hunter.save();
    res.status(201).send(hunter);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunter
 * @description Obtiene una lista de cazadores filtrados por nombre, tipo o ubicación.
 * @access Public
 * @param {string} [req.query.name] - Nombre del cazador.
 * @param {string} [req.query.race] - Tipo del cazador.
 * @param {string} [req.query.location] - Ubicación del cazador.
 * @returns {Object} 200 - Lista de cazadores encontrados.
 * @returns {Object} 404 - No se encontraron cazadores.
 * @returns {Object} 400 - Error en la solicitud.
 */
hunterRouter.get("/hunter", async (req, res) => {
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
      res.status(404).send({ error: "No hunters found" });
    }
    res.status(200).send(hunters);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /hunter/:id
 * @description Obtiene un cazador específico por su ID.
 * @access Public
 * @param {string} req.params.id - ID del cazador.
 * @returns {Object} 200 - El cazador encontrado.
 * @returns {Object} 404 - Cazador no encontrado.
 * @returns {Object} 500 - Error en la solicitud.
 */
hunterRouter.get("/hunter/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findById(req.params.id);
    if (!hunter) {
      res.status(404).send({ error: "Hunter not found" });
    }
    res.status(200).send(hunter);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /hunter
 * @description Actualiza un cazador utilizando su ID proporcionado en la query string.
 * @access Public
 * @param {string} req.query.name - Nombre del cazador a actualizar.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Object} 200 - El cazador actualizado.
 * @returns {Object} 400 - Error en la solicitud.
 * @returns {Object} 404 - Cazador no encontrado.
 */
hunterRouter.patch("/hunter", async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: "A name must be provided in the query string",
    });
  } else {
    const allowedUpdates = ["race", "location"];
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
        res.status(500).send(error);
      }
    }
  }
});

/**
 * @route PATCH /hunter/:id
 * @description Actualiza un cazador utilizando su ID proporcionado como parámetro dinámico.
 * @access Public
 * @param {string} req.params.id - ID del cazador a actualizar.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Object} 200 - El cazador actualizado.
 * @returns {Object} 400 - Error en la solicitud.
 * @returns {Object} 404 - Cazador no encontrado.
 */
hunterRouter.patch("/hunter/:id", async (req, res) => {
  const allowedUpdates = ["race", "location"];
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
      res.status(500).send(error);
    }
  }
});

/**
 * @route DELETE /hunter
 * @description Elimina cazadores utilizando filtros como nombre, tipo o ubicación.
 * @access Public
 * @param {string} [req.query.name] - Nombre del cazador.
 * @param {string} [req.query.race] - Tipo del cazador.
 * @param {string} [req.query.location] - Ubicación del cazador.
 * @returns {Object} 200 - Información sobre los cazadores eliminados.
 * @returns {Object} 404 - No se encontraron cazadores para eliminar.
 * @returns {Object} 500 - Error del servidor.
 */
hunterRouter.delete("/hunter", async (req, res) => {
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
      res.status(404).send({ error: "No hunters found" });
    } else {
      const result = await Hunter.deleteMany(filter);
      res.status(200).send({
        deletedCount: result.deletedCount,
        deletedGoods: hunters,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /hunter/:id
 * @description Elimina un cazador específico utilizando su ID.
 * @access Public
 * @param {string} req.params.id - ID del cazador a eliminar.
 * @returns {Object} 200 - El cazador eliminado.
 * @returns {Object} 404 - Cazador no encontrado.
 * @returns {Object} 400 - Error en la solicitud.
 */
hunterRouter.delete("/hunter/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findByIdAndDelete(req.params.id);
    if (!hunter) {
      res.status(404).send();
    }
    res.status(200).send(hunter);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default hunterRouter;
