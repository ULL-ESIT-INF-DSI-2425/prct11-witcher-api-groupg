import express from "express";
import { Transaction } from "../models/transaction.model.js";
import { Good } from "../models/good.model.js";
import { Hunter } from "../models/hunter.model.js";
import { Merchant } from "../models/merchant.model.js";

const transactionRouter = express.Router();

/**
 * @route POST /transactions
 * @description Creates a new transaction.
 * @param {Object} req.body - Transaction object to be created.
 * @returns {Object} 201 - The created transaction.
 * @returns {Object} 404 - Goods not found or insufficient stock.
 * @returns {Object} 500 - Server error.
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
    res.status(500).send({ error: error.message });
  }
});

/**
 * This function validates if the involved (Hunter or Merchant) exists in the database.
 * @param name - Hunter or Merchant name
 * @param involvedType - Hunter or Merchant
 * @param type - Buy or Sell
 * @returns - Involved object
 * @throws - Error if the involved does not exist and cannot be created
 */
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
          race: "Uknown",
          location: "Uknown",
        });
        await hunter.save();
        involved = hunter;
      }
    } else if (involvedType === "Merchant" && type === "Sell") {
      involved = await Merchant.findOne({ name });
      if (!involved) {
        const merchant = new Merchant({
          name,
          type: "Uknown",
          location: "Uknown",
        });
        await merchant.save();
        involved = merchant;
      }
    } else {
      throw new Error(
        "A hunter must be involved in a buy transaction and a merchant in a sell transaction.",
      );
    }
    return involved;
  } catch (error) {
    throw new Error(`Error validating involved: ${error.message}`);
  }
}

/**
 * This function validates the goods and processes them according to the transaction type.
 * @param goods - Array of goods to be processed
 * @param goods.name - Name of the good
 * @param goods.amount - Amount of the good
 * @param type - Transaction type (Buy or Sell)
 * @returns - Array of new goods and total value of the transaction
 * @throws - Error if there is an issue processing the goods
 */
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
 * @route GET /transactions/by-name
 * @description Shows the transactions filtered by name.
 * @param {string} [req.query.name] - Hunter or Merchant name to filter transactions.
 * @returns {Object} 200 - The transactions found.
 * @returns {Object} 500 - Server error.
 * @returns {Object} 404 - No involved found.
 */
transactionRouter.get("/transactions/by-name", async (req, res) => {
  const filter = req.query.name ? { name: req.query.name.toString() } : {};
  try {
    const hunter = await Hunter.findOne(filter);
    const merchant = await Merchant.findOne(filter);
    if (!hunter && !merchant) {
      res.status(404).send({ error: "Involved not found" });
    } else {
      const transactions = [];
      if (hunter) {
        const hunterTransactions = await Transaction.find({
          involvedID: hunter._id,
          involvedType: "Hunter",
        });
        transactions.push(...hunterTransactions);
      }
      if (merchant) {
        const merchantTransactions = await Transaction.find({
          involvedID: merchant._id,
          involvedType: "Merchant",
        });
        transactions.push(...merchantTransactions);
      }
      res.status(200).send(transactions);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route GET /transactions/by-date
 * @description Show the transactions filtered by a date range and type.
 * @param {string} req.query.startDate - Start date of the range.
 * @param {string} req.query.endDate - End date of the range.
 * @param {string} req.query.type - Type of transaction (Buy, Sell, Both).
 * @returns {Object} 200 - The transactions found.
 * @returns {Object} 400 - Bad request.
 * @returns {Object} 404 - No transactions found.
 * @returns {Object} 500 - Server error.
 */
transactionRouter.get("/transactions/by-date", async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    if (!startDate) {
      res.status(400).send({ error: "startDate is required" });
    } else if (!endDate) {
      res.status(400).send({ error: "endDate is required" });
    } else if (!type) {
      res.status(400).send({ error: "type is required" });
    }
    if (type !== "Buy" && type !== "Sell" && type !== "Both") {
      res.status(400).send({ error: "type must be 'Buy', 'Sell' or 'Both'" });
    }
    let filter = {};
    if (type === "Buy" || type === "Sell") {
      filter = {
        date: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
        type: type,
      };
    } else {
      filter = {
        date: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      };
    }
    const transactions = await Transaction.find(filter);
    if (transactions.length === 0) {
      res.status(404).send({ error: "No transactions found" });
    } else {
      res.status(200).send(transactions);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route GET /transactions/:id
 * @description Shows a transaction given its ID by dynamic parameter.
 * @param {string} req.params.id - Transaction ID.
 * @returns {Object} 200 - The transaction found.
 * @returns {Object} 404 - Transaction not found.
 * @returns {Object} 500 - Server error.
 */
transactionRouter.get("/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).send({ error: "Transaction not found" });
    } else {
      res.status(200).send(transaction);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route PATCH /transactions/:id
 * @description Updates a transaction given its ID by dynamic parameter.
 * @param {string} req.params.id - Transaction ID.
 * @param {Object} req.body - Transaction object to be updated.
 * @param {string} req.body.goods - Array of goods to be updated.
 * @param {string} req.body.goods.name - Name of the good.
 * @param {number} req.body.goods.amount - Amount of the good.
 * @returns {Object} 200 - The updated transaction.
 * @returns {Object} 400 - No goods found or insufficient stock.
 * @returns {Object} 404 - Transaction not found.
 * @returns {Object} 500 - Server error.
 */
transactionRouter.patch("/transactions/:id", async (req, res) => {
  try {
    const { goods: updatedGoods } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).send({ error: "Transaction not found" });
    } else {
      let totalValue = 0;
      let updated = false;
      for (const originalItem of transaction.goods) {
        const good = await Good.findById(originalItem.goodID._id);
        if (!good) continue;
        const updatedItem = updatedGoods.find(
          (item) => item.name === good.name,
        );
        if (!updatedItem) continue;
        const oldAmount = originalItem.amount;
        const newAmount = updatedItem.amount;
        const diff = newAmount - oldAmount;
        let newStock = 0;
        if (transaction.type === "Buy") {
          if (good.stock < diff) {
            continue;
          } else {
            newStock = good.stock - diff;
          }
        } else {
          newStock = good.stock + diff;
        }
        await Good.updateOne({ name: good.name }, { stock: newStock });
        originalItem.amount = newAmount;
        totalValue += good.value * newAmount;
        transaction.transactionValue = totalValue;
        transaction.date = new Date();
        await transaction.save();
        updated = true;
      }
      if (!updated) {
        res.status(400).send({
          error:
            "Goods not found or insufficient stock to update the transaction.",
        });
      } else {
        res.status(200).send(transaction);
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route DELETE /transactions/:id
 * @description Delete a transaction given its ID by dynamic parameter.
 * @param {string} req.params.id - Transaction ID.
 * @returns {Object} 200 - The deleted transaction.
 * @returns {Object} 404 - Transaction not found.
 * @returns {Object} 500 - Server error.
 */
transactionRouter.delete("/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).send({ error: "Transaction not found" });
    } else {
      let returned: boolean = true;
      const goodAndNewStock: { good: string; newStock: number }[] = [];
      for (const item of transaction.goods) {
        const good = await Good.findById(item.goodID);
        if (!good) continue;
        let newStock = 0;
        if (transaction.type === "Buy") {
          newStock = good.stock + item.amount;
        } else if (transaction.type === "Sell") {
          if (good.stock < item.amount) {
            returned = false;
            break;
          } else {
            newStock = good.stock - item.amount;
          }
        }
        goodAndNewStock.push({ good: good.name, newStock });
      }
      if (returned) {
        await Transaction.deleteOne({ _id: transaction._id });
        for (const { good, newStock } of goodAndNewStock) {
          await Good.updateOne({ name: good }, { stock: newStock });
        }
        res.status(200).send(transaction);
      } else {
        res.status(400).send({
          error:
            "Cannot delete transaction. Goods not found or insufficient stock.",
        });
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default transactionRouter;
