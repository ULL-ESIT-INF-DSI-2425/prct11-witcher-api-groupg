import express from "express";
import { Transaction } from "../models/transaction.model.js";
import { Good } from "../models/good.model.js";
import { Hunter } from "../models/hunter.model.js";
import { Merchant } from "../models/merchant.model.js";

const transactionRouter = express.Router();

/**
 * @route POST /transactions
 * @description Crea una nueva transacción.
 * @access Public
 * @param {Object} req.body - Datos de la transacción a crear.
 * @returns {Object} 201 - La transacción creada.
 * @returns {Object} 400 - Error en la solicitud.
 */
transactionRouter.post("/transactions", async (req, res) => {
  const { involvedId, involvedType, goodDetails } = req.body;

  try {
    const transaction = new Transaction({
      involvedId,
      involvedType,
      goodDetails,
      type: involvedType === "Hunter" ? "Sell" : "Buy",
    });

    // Actualizar stock de bienes
    for (const detail of goodDetails) {
      const good = await Good.findById(detail.goodId);
      if (!good) {
        throw new Error(`Bien con ID ${detail.goodId} no encontrado`);
      }
      if (transaction.type === "Sell") {
        if (good.quantity < detail.quantity) {
          throw new Error(`Stock insuficiente para el bien ${good.name}`);
        }
        good.quantity -= detail.quantity;
      } else {
        good.quantity += detail.quantity;
      }
      await good.save();
    }

    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route GET /transactions
 * @description Obtiene transacciones filtradas por ID, nombre del involucrado, rango de fechas o tipo.
 * @access Public
 * @param {string} [req.query.id] - ID de la transacción.
 * @param {string} [req.query.involvedName] - Nombre del cazador o mercader.
 * @param {string} [req.query.startDate] - Fecha de inicio del rango.
 * @param {string} [req.query.endDate] - Fecha de fin del rango.
 * @param {string} [req.query.type] - Tipo de transacción ("Buy" o "Sell").
 * @returns {Object} 200 - Lista de transacciones encontradas.
 * @returns {Object} 400 - Error en la solicitud.
 */
transactionRouter.get("/transactions", async (req, res) => {
  const { id, involvedName, startDate, endDate, type } = req.query;

  try {
    if (id) {
      const transaction = await Transaction.findById(id).populate("goodDetails.goodId");
      if (!transaction) {
        res.status(404).send({ error: "Transacción no encontrada" });
      }
      res.send(transaction);
    }

    const filter: any = {};
    if (involvedName) {
      filter.involvedName = involvedName;
    }
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    if (type) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).populate("goodDetails.goodId");
    res.send(transactions);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route GET /transactions/:id
 * @description Obtiene una transacción específica por su ID.
 * @access Public
 * @param {string} req.params.id - ID de la transacción.
 * @returns {Object} 200 - La transacción encontrada.
 * @returns {Object} 404 - Transacción no encontrada.
 * @returns {Object} 400 - Error en la solicitud.
 */
transactionRouter.get("/transactions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findById(id).populate("goodDetails.goodId");
    if (!transaction) {
      res.status(404).send({ error: "Transacción no encontrada" });
    }
    res.send(transaction);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route GET /transactions/involved/:name
 * @description Obtiene transacciones relacionadas con un cazador o mercader por su nombre.
 * @access Public
 * @param {string} req.params.name - Nombre del cazador o mercader.
 * @returns {Object} 200 - Lista de transacciones encontradas.
 * @returns {Object} 404 - Cazador o mercader no encontrado.
 * @returns {Object} 400 - Error en la solicitud.
 */
transactionRouter.get("/transactions/involved/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const hunter = await Hunter.findOne({ name });
    const merchant = await Merchant.findOne({ name });

    if (!hunter && !merchant) {
      res.status(404).send({ error: "Cazador o mercader no encontrado" });
    }

    const involvedId = hunter ? hunter._id : merchant._id;
    const involvedType = hunter ? "Hunter" : "Merchant";

    const transactions = await Transaction.find({ involvedId, involvedType }).populate("goodDetails.goodId");
    res.send(transactions);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route PATCH /transactions/:id
 * @description Actualiza una transacción específica por su ID.
 * @access Public
 * @param {string} req.params.id - ID de la transacción.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Object} 200 - La transacción actualizada.
 * @returns {Object} 404 - Transacción no encontrada.
 * @returns {Object} 400 - Error en la solicitud.
 */
transactionRouter.patch("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      res.status(404).send({ error: "Transacción no encontrada" });
    }

    // Revertir stock de bienes antes de actualizar
    for (const detail of transaction.goodDetails) {
      const good = await Good.findById(detail.goodId);
      if (transaction.type === "Sell") {
        good.quantity += detail.quantity;
      } else {
        good.quantity -= detail.quantity;
      }
      await good.save();
    }

    Object.assign(transaction, updates);

    // Actualizar stock de bienes con nuevos valores
    for (const detail of transaction.goodDetails) {
      const good = await Good.findById(detail.goodId);
      if (transaction.type === "Sell") {
        if (good.quantity < detail.quantity) {
          throw new Error(`Stock insuficiente para el bien ${good.name}`);
        }
        good.quantity -= detail.quantity;
      } else {
        good.quantity += detail.quantity;
      }
      await good.save();
    }

    await transaction.save();
    res.send(transaction);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route DELETE /transactions/:id
 * @description Elimina una transacción específica por su ID.
 * @access Public
 * @param {string} req.params.id - ID de la transacción.
 * @returns {Object} 200 - La transacción eliminada.
 * @returns {Object} 404 - Transacción no encontrada.
 * @returns {Object} 400 - Error en la solicitud.
 */
transactionRouter.delete("/transactions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      res.status(404).send({ error: "Transacción no encontrada" });
    }

    // Revertir stock de bienes
    for (const detail of transaction.goodDetails) {
      const good = await Good.findById(detail.goodId);
      if (transaction.type === "Sell") {
        good.quantity += detail.quantity;
      } else {
        good.quantity -= detail.quantity;
      }
      await good.save();
    }

    await Transaction.deleteOne({ _id: transaction._id });
    res.send(transaction);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

export default transactionRouter;