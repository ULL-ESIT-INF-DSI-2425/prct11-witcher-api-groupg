import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { Transaction } from "../src/models/transaction.model.js";
import { Good } from "../src/models/good.model.js";
import { Hunter } from "../src/models/hunter.model.js";
import { Merchant } from "../src/models/merchant.model.js";
import { afterEach } from "node:test";

const sampleHunter = {
  name: "Geralt",
  race: "Human",
  location: "Kaer Morhen",
};

const sampleMerchant = {
  name: "Hattori",
  type: "Blacksmith",
  location: "Novigrad",
};

const sampleGood = {
  name: "Silver Sword",
  description: "A sword made of silver effective against monsters",
  material: "Steel",
  weight: 3.5,
  stock: 10,
  value: 500,
};

beforeEach(async () => {
  await Transaction.deleteMany();
  await Hunter.deleteMany();
  await Merchant.deleteMany();
  await Good.deleteMany();

  const hunter = await new Hunter(sampleHunter).save();
  const merchant = await new Merchant(sampleMerchant).save();
  const good = await new Good(sampleGood).save();

  await new Transaction({
    involvedID: hunter._id,
    involvedType: "Hunter",
    goodDetails: [{ goodId: good._id, quantity: 2 }],
    type: "Sell",
    amount: 1500,
  }).save();

  await new Transaction({
    involvedID: merchant._id,
    involvedType: "Merchant",
    goodDetails: [{ goodId: good._id, quantity: 5 }],
    type: "Buy",
    amount: 2500,
  }).save();
});

afterEach(async () => {
  await Transaction.deleteMany();
  await Hunter.deleteMany();
  await Merchant.deleteMany();
  await Good.deleteMany();
});

describe("POST /transactions", () => {
  test("Should create a new transaction (Buy)", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        goods: [{ name: "Silver Sword", amount: 1 }],
        involvedName: "Geralt",
        involvedType: "Hunter",
        type: "Buy"
      })
      .expect(201);
  
    expect(response.body.type).toBe("Buy");
    expect(response.body.transactionValue).toBe(500); // 1 * 500 (value)
  });

  test("Should create a new transaction (Sell)", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        goods: [{ name: "New Item", amount: 5 }],
        involvedName: "Hattori",
        involvedType: "Merchant",
        type: "Sell",
      })
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.type).toBe("Sell");
    expect(response.body.transactionValue).toBeGreaterThan(0);
  });

  test("Should return 404 if goods are not found or insufficient stock", async () => {
    await request(app)
      .post("/transactions")
      .send({
        goods: [{ name: "Nonexistent Item", amount: 1 }],
        involvedName: "Geralt",
        involvedType: "Hunter",
        type: "Buy",
      })
      .expect(404);
  });

  test("Should return 500 for invalid involved type", async () => {
    await request(app)
      .post("/transactions")
      .send({
        goods: [{ name: "Silver Sword", amount: 1 }],
        involvedName: "Geralt",
        involvedType: "InvalidType",
        type: "Buy",
      })
      .expect(500);
  });
});
describe("GET /transactions", () => {
  test("Should get all transactions", async () => {
    const response = await request(app).get("/transactions").expect(200);
    expect(response.body).toHaveLength(2);
  });

  test("Should filter transactions by type", async () => {
    const response = await request(app)
      .get("/transactions")
      .query({ type: "Buy" })
      .expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].type).toBe("Buy");
  });

  test("Should filter transactions by involvedName", async () => {
    const response = await request(app)
      .get("/transactions")
      .query({ involvedName: "Geralt" })
      .expect(200);
    expect(response.body).toHaveLength(1);
  });

  test("Should filter transactions by date range", async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);

    const response = await request(app)
      .get("/transactions")
      .query({ startDate: startDate.toISOString(), endDate: endDate.toISOString() })
      .expect(200);
    expect(response.body).toHaveLength(2); // Cambia según los datos iniciales
  });

  test("Should return 400 for invalid query parameters", async () => {
    await request(app)
      .get("/transactions")
      .query({ invalidParam: "value" })
      .expect(400);
  });
});

describe("GET /transactions/:id", () => {
  test("Should get a transaction by ID", async () => {
    const transaction = await Transaction.findOne();
    const response = await request(app)
      .get(`/transactions/${transaction!._id}`)
      .expect(200);
  });

  test("Should return 404 if transaction ID does not exist", async () => {
    await request(app).get("/transactions/645c1b2f4f1a2567e8d9f000").expect(404);
  });
});

describe("PATCH /transactions/:id", () => {
  test("Should update a transaction by ID", async () => {
    const transaction = await Transaction.findOne();
    const response = await request(app)
      .patch(`/transactions/${transaction!._id}`)
      .send({ transactionValue: 1500 })
      .expect(200);
  
    expect(response.body.transactionValue).toBe(1500);
  });

  test("Should fail to update a transaction with invalid fields", async () => {
    const transaction = await Transaction.findOne();
    await request(app)
      .patch(`/transactions/${transaction!._id}`)
      .send({ invalidField: "value" })
      .expect(400);
  });

  test("Should return 404 if transaction ID does not exist", async () => {
    await request(app)
      .patch("/transactions/645c1b2f4f1a2567e8d9f000")
      .send({ amount: 1500 })
      .expect(404);
  });
  test("Should return 400 if trying to update with invalid goods", async () => {
    const transaction = await Transaction.findOne();
    await request(app)
      .patch(`/transactions/${transaction!._id}`)
      .send({ goods: [{ name: "Invalid Good", amount: 10 }] })
      .expect(400);
  });
});

describe("DELETE /transactions/:id", () => {
  test("Should delete a transaction by ID", async () => {
    const transaction = await Transaction.findOne();
    await request(app).delete(`/transactions/${transaction!._id}`).expect(200);

    const deletedTransaction = await Transaction.findById(transaction!._id);
    expect(deletedTransaction).toBe(null);
  });

  test("Should return 404 if transaction ID does not exist", async () => {
    await request(app).delete("/transactions/645c1b2f4f1a2567e8d9f000").expect(404);
  });
  test("Should return 400 if trying to delete a transaction with invalid ID", async () => {
    await request(app).delete("/transactions/invalidID").expect(500);
  });
});