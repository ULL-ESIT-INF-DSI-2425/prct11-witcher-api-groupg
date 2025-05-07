import express from "express";
import { Merchant } from "../models/merchant.model.js";

export const merchantRouter = express.Router();

/**
 * @route POST /merchant
 * @description Crea un nuevo mercader.
 * @access Public
 * @param {Object} req.body - Datos del mercader a crear.
 * @returns {Object} 201 - El mercader creado.
 * @returns {Object} 400 - Error en la solicitud.
 */
merchantRouter.post("/merchant", async (req, res) => {
  const merchant = new Merchant(req.body);
  try {
    await merchant.save();
    res.status(201).send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchant
 * @description Obtiene una lista de mercaderes filtrados por nombre, tipo o ubicación.
 * @access Public
 * @param {string} [req.query.name] - Nombre del mercader.
 * @param {string} [req.query.type] - Tipo del mercader.
 * @param {string} [req.query.location] - Ubicación del mercader.
 * @returns {Object} 200 - Lista de mercaderes encontrados.
 * @returns {Object} 404 - No se encontraron mercaderes.
 * @returns {Object} 500 - Error del servidor.
 */
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
    res.status(500).send(error);
  }
});

/**
 * @route GET /merchant/:id
 * @description Obtiene un mercader específico por su ID.
 * @access Public
 * @param {string} req.params.id - ID del mercader.
 * @returns {Object} 200 - El mercader encontrado.
 * @returns {Object} 404 - Mercader no encontrado.
 * @returns {Object} 400 - Error en la solicitud.
 */
merchantRouter.get("/merchant/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      res.status(404).send({ error: "Merchant not found" });
    }
    res.status(200).send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /merchant
 * @description Actualiza un mercader utilizando su ID proporcionado en la query string.
 * @access Public
 * @param {string} req.query.name - Nombre del mercader a actualizar.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Object} 200 - El mercader actualizado.
 * @returns {Object} 400 - Error en la solicitud.
 * @returns {Object} 404 - Mercader no encontrado.
 */
merchantRouter.patch("/merchant", async (req, res) => {
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
        res.status(500).send(error);
      }
    }
  }
});

/**
 * @route PATCH /merchant/:id
 * @description Actualiza un mercader utilizando su ID proporcionado como parámetro dinámico.
 * @access Public
 * @param {string} req.params.id - ID del mercader a actualizar.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Object} 200 - El mercader actualizado.
 * @returns {Object} 400 - Error en la solicitud.
 * @returns {Object} 404 - Mercader no encontrado.
 */
merchantRouter.patch("/merchant/:id", async (req, res) => {
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
      }
      res.status(200).send(merchant);
    } catch (error) {
      res.status(500).send(error);
    }
  }
});

/**
 * @route DELETE /merchant
 * @description Elimina mercaderes utilizando filtros como nombre, tipo o ubicación.
 * @access Public
 * @param {string} [req.query.name] - Nombre del mercader.
 * @param {string} [req.query.type] - Tipo del mercader.
 * @param {string} [req.query.location] - Ubicación del mercader.
 * @returns {Object} 200 - Información sobre los mercaderes eliminados.
 * @returns {Object} 404 - No se encontraron mercaderes para eliminar.
 * @returns {Object} 500 - Error del servidor.
 */
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
      res.status(200).send({
        deletedCount: result.deletedCount,
        deletedGoods: merchant,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /merchant/:id
 * @description Elimina un mercader específico utilizando su ID.
 * @access Public
 * @param {string} req.params.id - ID del mercader a eliminar.
 * @returns {Object} 200 - El mercader eliminado.
 * @returns {Object} 404 - Mercader no encontrado.
 * @returns {Object} 400 - Error en la solicitud.
 */
merchantRouter.delete("/merchant/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findByIdAndDelete(req.params.id);
    if (!merchant) {
      res.status(404).send({ error: "Merchant not found" });
    }
    res.status(200).send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default merchantRouter;
