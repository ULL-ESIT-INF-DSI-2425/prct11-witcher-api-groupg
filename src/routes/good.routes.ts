import express from "express";
import { Good } from "../models/good.model.js";

const goodRouter = express.Router();

/**
 * @route POST /goods
 * @description Crea un nuevo objeto Good en la base de datos.
 * @access Public
 * @param {Object} req.body - Datos del bien a crear.
 * @returns {Object} 201 - El bien creado.
 * @returns {Object} 500 - Error del servidor.
 */
goodRouter.post("/goods", async (req, res) => {
  const good = new Good(req.body);
  try {
    await good.save();
    res.status(201).send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods
 * @description Obtiene una lista de bienes filtrados por nombre, descripción o material.
 * @access Public
 * @param {string} [req.query.name] - Nombre del bien.
 * @param {string} [req.query.description] - Descripción del bien.
 * @param {string} [req.query.material] - Material del bien.
 * @returns {Object} 200 - Lista de bienes encontrados.
 * @returns {Object} 404 - No se encontraron bienes.
 * @returns {Object} 500 - Error del servidor.
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
      res.status(404).send({ error: "No goods found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route GET /goods/:id
 * @description Obtiene un bien específico por su ID.
 * @access Public
 * @param {string} req.params.id - ID del bien.
 * @returns {Object} 200 - El bien encontrado.
 * @returns {Object} 404 - Bien no encontrado.
 * @returns {Object} 500 - Error del servidor.
 */
goodRouter.get("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findById(req.params.id);
    if (!good) {
      res.status(404).send({ error: "Good not found" });
    }
    res.status(200).send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route PATCH /goods
 * @description Actualiza un bien utilizando su ID proporcionado en la query string.
 * @access Public
 * @param {string} req.query.id - ID del bien a actualizar.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Object} 200 - El bien actualizado.
 * @returns {Object} 400 - Error en la solicitud (ID no proporcionado o actualización no válida).
 * @returns {Object} 404 - Bien no encontrado.
 * @returns {Object} 500 - Error del servidor.
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
        res.status(500).send(error);
      }
    }
  }
});

/**
 * @route PATCH /goods/:id
 * @description Actualiza un bien utilizando su ID proporcionado como parámetro dinámico.
 * @access Public
 * @param {string} req.params.id - ID del bien a actualizar.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Object} 200 - El bien actualizado.
 * @returns {Object} 400 - Error en la solicitud (actualización no válida).
 * @returns {Object} 404 - Bien no encontrado.
 * @returns {Object} 500 - Error del servidor.
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
      res.status(500).send(error);
    }
  }
});

/**
 * @route DELETE /goods
 * @description Elimina bienes utilizando filtros como nombre, descripción o material.
 * @access Public
 * @param {string} [req.query.name] - Nombre del bien.
 * @param {string} [req.query.description] - Descripción del bien.
 * @param {string} [req.query.material] - Material del bien.
 * @returns {Object} 200 - Información sobre los bienes eliminados.
 * @returns {Object} 404 - No se encontraron bienes para eliminar.
 * @returns {Object} 500 - Error del servidor.
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
      res.status(404).send({ error: "No goods found" });
    } else {
      const result = await Good.deleteMany(filter);
      res.status(200).send({
        deletedCount: result.deletedCount,
        deletedGoods: goods,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route DELETE /goods/:id
 * @description Elimina un bien específico utilizando su ID.
 * @access Public
 * @param {string} req.params.id - ID del bien a eliminar.
 * @returns {Object} 200 - El bien eliminado.
 * @returns {Object} 404 - Bien no encontrado.
 * @returns {Object} 400 - Error en la solicitud.
 */
goodRouter.delete("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findByIdAndDelete(req.params.id);
    if (!good) {
      res.status(404).send();
    } else {
      res.status(200).send(good);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

export default goodRouter;
