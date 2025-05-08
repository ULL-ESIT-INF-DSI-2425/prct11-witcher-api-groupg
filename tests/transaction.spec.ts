import { describe, test, beforeEach, afterEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Transaction } from "../src/models/transaction.model.js";
import { Good } from "../src/models/good.model.js";
import { Hunter } from "../src/models/hunter.model.js";
import { Merchant } from "../src/models/merchant.model.js";

const sampleHunter = {
  name: "Geralt",
  type: "hunter",
  location: "Kaer Morhen",
};

const sampleMerchant = {
  name: "Hattori",
  type: "blacksmith",
  location: "Novigrad",
};

const sampleGood = {
  name: "Silver Sword",
  description: "A sword made of silver, effective against monsters.",
  material: "Silver",
  weight: 3.5,
  quantity: 10,
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
    involvedId: hunter._id,
    involvedType: "Hunter",
    goodDetails: [{ goodId: good._id, quantity: 2 }],
    type: "Sell",
    amount: 1000,
  }).save();

  await new Transaction({
    involvedId: merchant._id,
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

describe("GET /transactions/:id", () => {
  test("Should get a transaction by ID", async () => {
    const transaction = await Transaction.findOne();
    const response = await request(app)
      .get(`/transactions/${transaction!._id}`)
      .expect(200);

    expect(response.body).to.include({
      type: transaction!.type,
      amount: transaction!.transactionValue,
    });
  });

  test("Should return 404 if transaction ID does not exist", async () => {
    await request(app).get("/transactions/645c1b2f4f1a2567e8d9f000").expect(404);
  });
});

describe("GET /transactions/involved/:name", () => {
  test("Should get transactions by involved name (Hunter)", async () => {
    const response = await request(app)
      .get("/transactions/involved/Geralt")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].involvedType).to.equal("Hunter");
  });

  test("Should get transactions by involved name (Merchant)", async () => {
    const response = await request(app)
      .get("/transactions/involved/Hattori")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].involvedType).to.equal("Merchant");
  });

  test("Should return 404 if no transactions found for the involved name", async () => {
    await request(app).get("/transactions/involved/Unknown").expect(404);
  });
});

describe("PATCH /transactions/:id", () => {
  test("Should update a transaction by ID", async () => {
    const transaction = await Transaction.findOne();
    const response = await request(app)
      .patch(`/transactions/${transaction!._id}`)
      .send({ amount: 1500 })
      .expect(200);

    expect(response.body.amount).to.equal(1500);

    const updatedTransaction = await Transaction.findById(transaction!._id);
    expect(updatedTransaction!.transactionValue).to.equal(1500);
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
});