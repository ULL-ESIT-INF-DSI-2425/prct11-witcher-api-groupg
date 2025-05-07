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
  const { goods, involvedName, involvedType, type } = req.body;

  try {
    // Validar cazador o mercader
    const involved = await validateInvolved(involvedName, involvedType, type);

    // Validar bienes y calcular importe total
    const { newGoods, totalValue } = await validateAndProcessGoods(goods, type);

    if (newGoods.length === 0) {
      res.status(404).send({ error: "Goods not found or insufficient stock" });
    }
    // Crear transacción
    const transaction = new Transaction({
      goods: newGoods,
      involvedID: involved._id,
      involvedType,
      type,
      transactionValue: totalValue,
    });

    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    res.status(500).send(error);
  }
});

async function validateInvolved(
  name: string,
  involvedType: "Hunter" | "Merchant",
  type: "Buy" | "Sell",
) {
  let involved;
  if (involvedType === "Hunter" && type === "Buy") {
    involved = await Hunter.findOne({ name });
    if (!involved) throw new Error("Cazador no encontrado");
  } else if (involvedType === "Merchant" && type === "Sell") {
    involved = await Merchant.findOne({ name });
    if (!involved) throw new Error("Mercader no encontrado");
  } else {
    throw new Error(
      "Un cazador no puede comprar y un mercader no puede vender",
    );
  }
  return involved;
}

async function validateAndProcessGoods(
  goods: { name: string; amount: number }[],
  type: "Buy" | "Sell",
) {
  const newGoods = [];
  let totalValue = 0;
  for (const { name, amount } of goods) {
    const good = await Good.findOne({ name });
    if (type === "Buy") {
      if (!good) continue;
      else if (good.stock < amount) continue;
      else {
        good.stock -= amount;
        await good.save();
        newGoods.push({ goodID: good._id, amount });
        totalValue += good.value * amount;
      }
    } else if (type === "Sell") {
      if (!good) {
        const newGood = new Good({
          name,
          description: "Bien creado automáticamente",
          material: "Material desconocido",
          weight: 10,
          stock: amount,
          value: 100,
        });
        await newGood.save();
        newGoods.push({ goodID: newGood._id, amount });
        totalValue += good.value * amount;
      } else {
        good.stock += amount;
        await good.save();
        newGoods.push({ goodID: good._id, amount });
        totalValue += good.value * amount;
      }
    }
  }
  return { newGoods, totalValue };
}

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
      const transaction =
        await Transaction.findById(id).populate("goodDetails.goodId");
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
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }
    if (type) {
      filter.type = type;
    }

    const transactions =
      await Transaction.find(filter).populate("goodDetails.goodId");
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
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).send({ error: "Transaction not found" });
    }
    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send(error);
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
    if (!hunter) {
      throw new Error("Hunter not found");
    }
    const merchant = await Merchant.findOne({ name });
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    if (!hunter && !merchant) {
      res.status(404).send({ error: "Cazador o mercader no encontrado" });
    }

    const involvedId = hunter ? hunter._id : merchant._id;
    const involvedType = hunter ? "Hunter" : "Merchant";

    const transactions = await Transaction.find({
      involvedId,
      involvedType,
    }).populate("goodDetails.goodId");
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
    for (const detail of transaction.goods) {
      const good = await Good.findById(detail.goodID);
      if (transaction.type === "Sell") {
        good.stock += detail.amount;
      } else {
        good.stock -= detail.amount;
      }
      await good.save();
    }

    Object.assign(transaction, updates);

    // Actualizar stock de bienes con nuevos valores
    for (const detail of transaction.goods) {
      const good = await Good.findById(detail.goodID);
      if (transaction.type === "Sell") {
        if (good.stock < detail.amount) {
          throw new Error(`Stock insuficiente para el bien ${good.name}`);
        }
        good.stock -= detail.amount;
      } else {
        good.stock += detail.amount;
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
    for (const detail of transaction.goods) {
      const good = await Good.findById(detail.goodID);
      if (transaction.type === "Sell") {
        good.stock += detail.amount;
      } else {
        good.stock -= detail.amount;
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
