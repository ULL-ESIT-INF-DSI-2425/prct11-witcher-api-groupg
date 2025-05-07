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
    const involved = await validateInvolved(involvedName, involvedType, type);
    const { newGoods, totalValue } = await validateAndProcessGoods(goods, type);
    if (newGoods.length === 0) {
      res.status(404).send({ error: "Goods not found or insufficient stock" });
    } else {
      const transaction = new Transaction({
        goods: newGoods,
        involvedID: involved._id,
        involvedType,
        type,
        transactionValue: totalValue,
      });
      await transaction.save();
      res.status(201).send(transaction);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

async function validateInvolved(
  name: string,
  involvedType: "Hunter" | "Merchant",
  type: "Buy" | "Sell",
) {
  try {
    let involved;
    if (involvedType === "Hunter" && type === "Buy") {
      involved = await Hunter.findOne({ name });
      if (!involved) {
        const hunter = new Hunter({
          name,
          race: "No especificado",
          location: "No especificado",
        });
        await hunter.save();
        involved = hunter;
      }
    } else if (involvedType === "Merchant" && type === "Sell") {
      involved = await Merchant.findOne({ name });
      if (!involved) {
        const merchant = new Merchant({
          name,
          type: "No especificado",
          location: "No especificado",
        });
        await merchant.save();
        involved = merchant;
      }
    } else {
      throw new Error(
        "Un cazador no puede vender y un mercader no puede comprar",
      );
    }
    return involved;
  } catch (error) {
    throw new Error(`Error al validar el involucrado: ${error.message}`);
  }
}

// Buy -> El cazador compra bienes
// Sell -> El mercader vende bienes
async function validateAndProcessGoods(
  goods: { name: string; amount: number }[],
  type: "Buy" | "Sell",
) {
  try {
    const newGoods = [];
    let totalValue = 0;
    for (const { name, amount } of goods) {
      const good = await Good.findOne({ name });
      if (type === "Buy") {
        if (!good || good.stock < amount) continue;
        else {
          const newStock = good.stock - amount;
          await Good.updateOne({ name: good.name }, { stock: newStock });
          newGoods.push({ goodID: good._id, amount });
          totalValue += good.value * amount;
        }
      } else if (type === "Sell") {
        if (!good) {
          const newGood = new Good({
            name,
            description: "Bien creado automáticamente",
            material: "Desconocido",
            weight: 10,
            stock: amount,
            value: 100,
          });
          await newGood.save();
          newGoods.push({ goodID: newGood._id, amount });
          totalValue += newGood.value * amount;
        } else {
          const newStock = good.stock + amount;
          await Good.updateOne({ name: good.name }, { stock: newStock });
          newGoods.push({ goodID: good._id, amount });
          totalValue += good.value * amount;
        }
      }
    }
    return { newGoods, totalValue };
  } catch (error) {
    throw new Error(`Error validating and processing goods: ${error.message}`);
  }
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
  const { involvedName, startDate, endDate, type } = req.query;
  try {
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
 * @route PATCH /transactions/:id
 * @description Actualiza una transacción específica por su ID.
 * @access Public
 * @param {string} req.params.id - ID de la transacción.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Object} 200 - La transacción actualizada.
 * @returns {Object} 404 - Transacción no encontrada.
 * @returns {Object} 400 - Error en la solicitud.
 * {
 *  "goods": [
 * }
 */
transactionRouter.patch("/transactions/:id", async (req, res) => {
  try {
    const { goods: updatedGoods } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).send({ error: "Transacción no encontrada." });
    } else {
      let totalValue = 0;
      for (const originalItem of transaction.goods) {
        const goodName = originalItem.goodID.name;
        const updatedItem = updatedGoods.find(
          (item) => item.name === goodName
        );
        if (!updatedItem) {
          res.status(400).send({
            error: `No se pueden eliminar ni añadir bienes. Bien omitido: ${goodName}`,
          });
        }
        const good = await Good.findOne({ name: goodName });
        if (!good) continue;
        const oldAmount = originalItem.amount;
        const newAmount = updatedItem.amount;
        const diff = newAmount - oldAmount;
        if (transaction.type === "Buy" && good.stock < diff) {
          res.status(400).send({
            error: `Stock insuficiente para "${good.name}". Stock actual: ${good.stock}`,
          });
        }
        if (transaction.type === "Buy") {
          good.stock -= diff;
        } else {
          good.stock += diff;
        }
        await good.save();
        originalItem.amount = newAmount;
        totalValue += good.value * newAmount;
      }
      transaction.transactionValue = totalValue;
      transaction.date = new Date();
      await transaction.save();
      res.status(200).send(transaction);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
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
      if (!good) {
        throw new Error(`Good not found: ${detail.goodID}`);
      }
      // Revertir el stock según el tipo de transacción
      /*
      if (transaction.type === "Sell") {
        good.stock += detail.amount;
      } else {
        good.stock -= detail.amount;
      }
      await good.save();*/
    }

    await Transaction.deleteOne({ _id: transaction._id });
    res.send(transaction);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

export default transactionRouter;
