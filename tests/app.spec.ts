import { describe, test, beforeEach, afterEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Transaction } from "../src/models/transaction.model.js";
import { Good } from "../src/models/good.model.js";
import { Hunter } from "../src/models/hunter.model.js";
import { Merchant } from "../src/models/merchant.model.js";
import {
  validateInvolved,
  validateAndProcessGoods,
} from "../src/routes/transaction.routes.js";

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

const sampleGood2 = {
  name: "Steel Shield",
  description: "A shield made of steel",
  material: "Steel",
  weight: 5,
  stock: 20,
  value: 300,
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
    goods: [{ goodID: good._id, amount: 2 }],
    type: "Buy",
    transactionValue: 1500,
  }).save();

  await new Transaction({
    involvedID: merchant._id,
    involvedType: "Merchant",
    goods: [{ goodID: good._id, amount: 5 }],
    type: "Sell",
    transactionValue: 2500,
  }).save();
});

afterEach(async () => {
  await Transaction.deleteMany();
  await Hunter.deleteMany();
  await Merchant.deleteMany();
  await Good.deleteMany();
});

// Transaction Tests
describe("Transaction API", () => {
  describe("POST /transactions", () => {
    test("Should create a new transaction (Buy)", async () => {
      const response = await request(app)
        .post("/transactions")
        .send({
          goods: [{ name: "Silver Sword", amount: 1 }],
          involvedName: "Geralt",
          involvedType: "Hunter",
          type: "Buy",
        })
        .expect(201);

      expect(response.body.type).toBe("Buy");
      expect(response.body.transactionValue).toBe(500);
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

  describe("ValidateInvolved", () => {
    test("Should return the hunter", async () => {
      const result = await validateInvolved("Geralt", "Hunter", "Buy");
      expect(result).toMatchObject(sampleHunter);
    });

    test("Should return the merchant", async () => {
      const result = await validateInvolved("Hattori", "Merchant", "Sell");
      expect(result).toMatchObject(sampleMerchant);
    });

    test("Should create a new hunter if not found", async () => {
      const result = await validateInvolved("Triss", "Hunter", "Buy");
      expect(result).toMatchObject({
        name: "Triss",
        race: "Unknown",
        location: "Unknown",
      });
    });

    test("Should create a new merchant if not found", async () => {
      const result = await validateInvolved("Zoltan", "Merchant", "Sell");
      expect(result).toMatchObject({
        name: "Zoltan",
        type: "Unknown",
        location: "Unknown",
      });
    });
  });

  describe("ValidateAndProcessGoods", () => {
    test("Should return the goods with their IDs and total value in a buy", async () => {
      const goods = [
        { name: "Silver Sword", amount: 1 },
        { name: "Steel Shield", amount: 2 },
      ];
      const good = await Good.findOne({ name: "Silver Sword" });
      const result = await validateAndProcessGoods(goods, "Buy");
      expect(result.newGoods).toHaveLength(1);
      expect(result.newGoods[0]).toMatchObject({goodID: good!._id, amount: 1});
      expect(result.totalValue).toBe(500);
      const updatedGood = await Good.findById(good!._id);
      expect(updatedGood!.stock).toBe(9);
    });

    test("Should return the goods with their IDs and total value in a sell", async () => {
      const goods = [
        { name: "Silver Sword", amount: 1 },
        { name: "Steel Shield", amount: 2 },
      ];
      const good = await Good.findOne({ name: "Silver Sword" });
      const result = await validateAndProcessGoods(goods, "Sell");
      expect(result.newGoods).toHaveLength(2);
      expect(result.newGoods[0]).toMatchObject({goodID: good!._id, amount: 1});
      expect(result.totalValue).toBe(700);
      const updatedGood = await Good.findById(good!._id);
      expect(updatedGood!.stock).toBe(11);
    });
  });

  describe("GET /transactions", () => {
    test("Should get all transactions", async () => {
      const response = await request(app).get("/transactions").expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("type");
      expect(response.body[0]).toHaveProperty("transactionValue");
    });

    test("Should filter transactions by type 'Buy'", async () => {
      const response = await request(app)
        .get("/transactions")
        .query({ type: "Buy" })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe("Buy");
    });

    test("Should filter transactions by type 'Sell'", async () => {
      const response = await request(app)
        .get("/transactions")
        .query({ type: "Sell" })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe("Sell");
    });

    test("Should return 404 if no transactions match the query", async () => {
      await request(app)
        .get("/transactions")
        .query({ type: "InvalidType" })
        .expect(404);
    });
  });

  describe("GET /transactions/by-name", () => {
    test("Should return transactions for a given hunter name", async () => {
      const response = await request(app)
        .get("/transactions/by-name")
        .query({ name: "Geralt" })
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].involvedType).toBe("Hunter");
      expect(response.body[0].transactionValue).toBe(1500);
    });

    test("Should return transactions for a given merchant name", async () => {
      const response = await request(app)
        .get("/transactions/by-name")
        .query({ name: "Hattori" })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].involvedType).toBe("Merchant");
      expect(response.body[0].transactionValue).toBe(2500);
    });

    test("Should return 404 if no transactions are found for the given name", async () => {
      await request(app)
        .get("/transactions/by-name")
        .query({ name: "Unknown" })
        .expect(404);
    });

    test("Should return 400 if name is missing", async () => {
      await request(app).get("/transactions/by-name").expect(400);
    });
  });

  describe("GET /transactions/by-date", () => {
    test("Should return transactions within a date range for type 'Buy'", async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() + 1);

      const response = await request(app)
        .get("/transactions/by-date")
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: "Buy",
        })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe("Buy");
    });

    test("Should return transactions within a date range for type 'Sell'", async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() + 1);

      const response = await request(app)
        .get("/transactions/by-date")
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: "Sell",
        })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe("Sell");
    });

    test("Should return transactions within a date range for type 'Both'", async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() + 1);

      const response = await request(app)
        .get("/transactions/by-date")
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: "Both",
        })
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    test("Should return 400 if startDate is missing", async () => {
      await request(app)
        .get("/transactions/by-date")
        .query({ endDate: new Date().toISOString(), type: "Buy" })
        .expect(400);
    });

    test("Should return 400 if endDate is missing", async () => {
      await request(app)
        .get("/transactions/by-date")
        .query({ startDate: new Date().toISOString(), type: "Buy" })
        .expect(400);
    });

    test("Should return 400 if type is missing", async () => {
      await request(app)
        .get("/transactions/by-date")
        .query({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        })
        .expect(400);
    });

    test("Should return 400 if type is invalid", async () => {
      await request(app)
        .get("/transactions/by-date")
        .query({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          type: "InvalidType",
        })
        .expect(400);
    });

    test("Should return 404 if no transactions are found in the date range", async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(startDate.getDate() + 10);
      endDate.setDate(endDate.getDate() + 20);

      await request(app)
        .get("/transactions/by-date")
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: "Both",
        })
        .expect(404);
    });
  });

  describe("GET /transactions/:id", () => {
    test("Should get a transaction by ID", async () => {
      const transaction = await Transaction.findOne();
      await request(app).get(`/transactions/${transaction!._id}`).expect(200);
    });

    test("Should return 404 if transaction ID does not exist", async () => {
      await request(app)
        .get("/transactions/645c1b2f4f1a2567e8d9f000")
        .expect(404);
    });

    test("Should return 500 if transaction ID is invalid", async () => {
      await request(app).get("/transactions/invalidID").expect(500);
    });
  });

  describe("PATCH /transactions/:id", () => {
    test("Should fail to update a transaction with invalid fields", async () => {
      const transaction = await Transaction.findOne();
      await request(app)
        .patch(`/transactions/${transaction!._id}`)
        .send({ invalidField: "value" })
        .expect(500);
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

    test("Should update a transaction by ID in a buy", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      const transaction = await Transaction.findOne({
        involvedID: hunter!._id,
      });
      const good = await Good.findOne({ name: "Silver Sword" });
      const response = await request(app)
        .patch(`/transactions/${transaction!._id}`)
        .send({
          goods: [{ name: good!.name, amount: 1 }],
        })
        .expect(200);
      expect(response.body.goods[0].amount).toBe(1);
      expect(response.body.transactionValue).toBe(500);
    });

    test("Should return an error when not enough stock", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      const transaction = await Transaction.findOne({
        involvedID: hunter!._id,
      });
      const good = await Good.findOne({ name: "Silver Sword" });
      await request(app)
        .patch(`/transactions/${transaction!._id}`)
        .send({
          goods: [{ name: good!.name, amount: 20 }],
        })
        .expect(400);
    });

    test("Should update a transaction by ID in a sell", async () => {
      const merchant = await Merchant.findOne({ name: "Hattori" });
      const transaction = await Transaction.findOne({
        involvedID: merchant!._id,
      });
      const good = await Good.findOne({ name: "Silver Sword" });
      const response = await request(app)
        .patch(`/transactions/${transaction!._id}`)
        .send({
          goods: [{ name: good!.name, amount: 1 }],
        })
        .expect(200);
      expect(response.body.goods[0].amount).toBe(1);
      expect(response.body.transactionValue).toBe(500);
    });
  });

  describe("DELETE /transactions/:id", () => {
    test("Should delete a transaction by ID", async () => {
      const transaction = await Transaction.findOne();
      await request(app)
        .delete(`/transactions/${transaction!._id}`)
        .expect(200);

      const deletedTransaction = await Transaction.findById(transaction!._id);
      expect(deletedTransaction).toBe(null);
    });

    test("Should return 404 if transaction ID does not exist", async () => {
      await request(app)
        .delete("/transactions/645c1b2f4f1a2567e8d9f000")
        .expect(404);
    });

    test("Should return 500 if trying to delete a transaction with invalid ID", async () => {
      await request(app).delete("/transactions/invalidID").expect(500);
    });

    test("Should return 400 if trying to delete a sell transaction with not enough stock", async () => {
      await request(app)
        .patch("/goods?name=Silver Sword")
        .send({ stock: 1 })
        .expect(200);
      const transaction = await Transaction.findOne({type: "Sell"});
      await request(app).delete(`/transactions/${transaction!._id}`).expect(400);
    });
    
    test("Should delete a sell transaction and update the stock", async () => {
      const transaction = await Transaction.findOne({type: "Sell"});
      const good = await Good.findOne({ name: "Silver Sword" });
      await request(app).delete(`/transactions/${transaction!._id}`).expect(200);
      const deletedTransaction = await Transaction.findById(transaction!._id);
      expect(deletedTransaction).toBe(null);
      const updatedGood = await Good.findById(good!._id);
      expect(updatedGood!.stock).toBe(5);
    });
  });
});

// Good Tests
describe("Good API", () => {
  describe("POST /goods", () => {
    test("Should successfully create a new good", async () => {
      const response = await request(app)
        .post("/goods")
        .send({
          name: "Shield",
          description: "Wood shield",
          material: "Wood",
          weight: 1,
          stock: 1,
          value: 20,
        })
        .expect(201);
      expect(response.body).toMatchObject({
        name: "Shield",
        description: "Wood shield",
        material: "Wood",
        weight: 1,
        stock: 1,
        value: 20,
      });
    });

    test("Should fail to create a good with an existing name", async () => {
      await request(app).post("/goods").send(sampleGood).expect(500);
    });

    test("Should fail to create a good with invalid material", async () => {
      await request(app)
        .post("/goods")
        .send({
          name: "Shields",
          description: "Wood shields",
          material: "invalid-material",
          weight: 2,
          stock: 10,
          value: 100,
        })
        .expect(500);
    });

    test("Should fail to create a good with invalid weight", async () => {
      await request(app)
        .post("/goods")
        .send({
          name: "Shields",
          description: "Wood shields",
          material: "Wood",
          weight: -2,
          stock: 10,
          value: 100,
        })
        .expect(500);
    });

    test("Should fail to create a good with invalid stock", async () => {
      await request(app)
        .post("/goods")
        .send({
          name: "Shields",
          description: "Wood shields",
          material: "Wood",
          weight: 2,
          stock: -10,
          value: 100,
        })
        .expect(500);
    });

    test("Should fail to create a good with invalid value", async () => {
      await request(app)
        .post("/goods")
        .send({
          name: "Shields",
          description: "Wood shields",
          material: "Wood",
          weight: 2,
          stock: 10,
          value: -100,
        })
        .expect(500);
    });

    test("Should fail to create a good with missing required fields", async () => {
      await request(app)
        .post("/goods")
        .send({
          name: "Shields",
          description: "Wood shields",
          material: "Wood",
          weight: 2,
          stock: 10,
        })
        .expect(500);
    });
  });

  describe("GET /goods", () => {
    test("Should get goods by query parameters", async () => {
      const response = await request(app)
        .get("/goods?name=Silver Sword")
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleGood);
    });

    test("Should all goods with steel material", async () => {
      await new Good(sampleGood2).save();
      const response = await request(app)
        .get("/goods?material=Steel")
        .expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject(sampleGood);
      expect(response.body[1]).toMatchObject(sampleGood2);
    });

    test("Should return Silver Sword searching by description and material", async () => {
      await new Good(sampleGood2).save();
      const response = await request(app)
        .get(
          "/goods?description=A sword made of silver effective against monsters&material=Steel",
        )
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleGood);
    });

    test("Should return all goods if no query parameters are provided", async () => {
      await new Good(sampleGood2).save();
      const response = await request(app).get("/goods").expect(200);
      expect(response.body).toHaveLength(2);
    });

    test("Should return 404 if no goods match the query", async () => {
      await request(app).get("/goods?name=Unknown").expect(404);
    });
  });

  describe("GET /goods/:id", () => {
    test("Should get a good by ID", async () => {
      const good = await Good.findOne({ name: "Silver Sword" });
      const response = await request(app)
        .get(`/goods/${good!._id}`)
        .expect(200);

      expect(response.body).toMatchObject(sampleGood);
    });

    test("Should return 404 if good ID does not exist", async () => {
      await request(app).get("/goods/645c1b2f4f1a2567e8d9f000").expect(404);
    });

    test("Should return 500 if good ID is invalid", async () => {
      await request(app).get("/goods/invalidID").expect(500);
    });
  });

  describe("PATCH /goods/", () => {
    test("Should update a good passing the name by query", async () => {
      const good = await Good.findOne({ name: "Silver Sword" });
      const response = await request(app)
        .patch("/goods?name=Silver Sword")
        .send({ stock: 5 })
        .expect(200);
      expect(response.body.stock).toBe(5);
      const updatedGood = await Good.findById(good!._id);
      expect(updatedGood!.stock).toBe(5);
    });

    test("Should fail to update with invalid fields", async () => {
      await request(app)
        .patch("/goods?name=Silver Sword")
        .send({ invalidField: "value" })
        .expect(400);
    });

    test("Should fail to update to update if no name is provided", async () => {
      await request(app).patch("/goods").send({ stock: 5 }).expect(400);
    });

    test("Should return 404 if good does not exist", async () => {
      await request(app)
        .patch("/goods?name=Unknown")
        .send({ stock: 5 })
        .expect(404);
    });
  });

  describe("PATCH /goods/:id", () => {
    test("Should update a good by ID", async () => {
      const good = await Good.findOne({ name: "Silver Sword" });
      const response = await request(app)
        .patch(`/goods/${good!._id}`)
        .send({ stock: 5 })
        .expect(200);

      expect(response.body.stock).toBe(5);

      const updatedGood = await Good.findById(good!._id);
      expect(updatedGood!.stock).toBe(5);
    });

    test("Should fail to update with invalid fields", async () => {
      const good = await Good.findOne({ name: "Silver Sword" });
      await request(app)
        .patch(`/goods/${good!._id}`)
        .send({ invalidField: "value" })
        .expect(400);
    });

    test("Should return 404 if good ID does not exist", async () => {
      await request(app)
        .patch("/goods/645c1b2f4f1a2567e8d9f000")
        .send({ stock: 2 })
        .expect(404);
    });

    test("Should return 500 if good ID is invalid", async () => {
      await request(app)
        .patch("/goods/invalidID")
        .send({ stock: 2 })
        .expect(500);
    });
  });

  describe("DELETE /goods", () => {
    test("Should delete a good passing the name by query", async () => {
      const good = await Good.findOne({ name: "Silver Sword" });
      await request(app).delete("/goods?name=Silver Sword").expect(200);
      const deletedGood = await Good.findById(good!._id);
      expect(deletedGood).toBe(null);
    });

    test("Should delete a good passing the description by query", async () => {
      const good = await Good.findOne({ name: "Silver Sword" });
      await request(app)
        .delete(
          "/goods?description=A sword made of silver effective against monsters",
        )
        .expect(200);
      const deletedGood = await Good.findById(good!._id);
      expect(deletedGood).toBe(null);
    });

    test("Should delete a good passing the material by query", async () => {
      const good = await Good.findOne({ name: "Silver Sword" });
      await request(app).delete("/goods?material=Steel").expect(200);
      const deletedGood = await Good.findById(good!._id);
      expect(deletedGood).toBe(null);
    });

    test("Should return 404 if no goods match the query", async () => {
      await request(app).delete("/goods?name=Unknown").expect(404);
    });
  });

  describe("DELETE /goods/:id", () => {
    test("Should delete a good by ID", async () => {
      const good = await Good.findOne({ name: "Silver Sword" });
      await request(app).delete(`/goods/${good!._id}`).expect(200);

      const deletedGood = await Good.findById(good!._id);
      expect(deletedGood).toBe(null);
    });

    test("Should return 404 if good ID does not exist", async () => {
      await request(app).delete("/goods/645c1b2f4f1a2567e8d9f000").expect(404);
    });

    test("Should return 500 if good ID is invalid", async () => {
      await request(app).delete("/goods/invalidID").expect(500);
    });
  });
});

// Merchant Tests
describe("Merchant API", () => {
  describe("POST /merchants", () => {
    test("Should successfully create a new merchant", async () => {
      const response = await request(app)
        .post("/merchants")
        .send({
          name: "Zoltan",
          type: "General",
          location: "Vergen",
        })
        .expect(201);

      expect(response.body).toMatchObject({
        name: "Zoltan",
        type: "General",
        location: "Vergen",
      });

      const merchantInDb = await Merchant.findById(response.body._id);
      expect(merchantInDb).not.toBe(null);
      expect(merchantInDb!.name).toBe("Zoltan");
    });

    test("Should fail to create a merchant with duplicate name", async () => {
      await request(app).post("/merchants").send(sampleMerchant).expect(500);
    });

    test("Should fail to create a merchant with invalid type", async () => {
      await request(app)
        .post("/merchants")
        .send({
          name: "Dandelion",
          type: "invalid-type",
          location: "Oxenfurt",
        })
        .expect(500);
    });
  });

  describe("GET /merchants", () => {
    test("Should get merchants searching by name by query parameters", async () => {
      const response = await request(app)
        .get("/merchants?name=Hattori")
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleMerchant);
    });

    test("Should get merchants searching by type by query parameters", async () => {
      const response = await request(app)
        .get("/merchants?type=Blacksmith")
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleMerchant);
    });

    test("Should get merchants searching by location by query parameters", async () => {
      const response = await request(app)
        .get("/merchants?location=Novigrad")
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleMerchant);
    });

    test("Should return 404 if no merchants match the query", async () => {
      await request(app).get("/merchants?name=Unknown").expect(404);
    });
  });

  describe("GET /merchants/:id", () => {
    test("Should get a merchant by ID", async () => {
      const merchant = await Merchant.findOne({ name: "Hattori" });
      const response = await request(app)
        .get(`/merchants/${merchant!._id}`)
        .expect(200);

      expect(response.body).toMatchObject(sampleMerchant);
    });

    test("Should return 404 if merchant ID does not exist", async () => {
      await request(app).get("/merchants/645c1b2f4f1a2567e8d9f000").expect(404);
    });

    test("Should return 500 if merchant ID is invalid", async () => {
      await request(app).get("/merchants/invalidID").expect(500);
    });
  });

  describe("PATCH /merchants", () => {
    test("Should fail to update a merchant if name query is not provided", async () => {
      await request(app)
        .patch("/merchants")
        .send({ location: "Oxenfurt" })
        .expect(400);
    });

    test("Should return 404 if no merchants match the query", async () => {
      await request(app)
        .patch("/merchants?name=Unknown")
        .send({ location: "Oxenfurt" })
        .expect(404);
    });

    test("Should update a merchant passing the name by query", async () => {
      const response = await request(app)
        .patch("/merchants?name=Hattori")
        .send({ location: "Oxenfurt" })
        .expect(200);

      expect(response.body.location).toBe("Oxenfurt");

      const updatedMerchant = await Merchant.findOne({ name: "Hattori" });
      expect(updatedMerchant!.location).toBe("Oxenfurt");
    });

    test("Should fail to update with invalid fields", async () => {
      await request(app)
        .patch("/merchants?name=Hattori")
        .send({ invalidField: "value" })
        .expect(400);
    });

    test("Should return 404 if merchant does not exist", async () => {
      await request(app)
        .patch("/merchants?name=Unknown")
        .send({ location: "Oxenfurt" })
        .expect(404);
    });
  });

  describe("PATCH /merchants/:id", () => {
    test("Should update a merchant by ID", async () => {
      const merchant = await Merchant.findOne({ name: "Hattori" });
      const response = await request(app)
        .patch(`/merchants/${merchant!._id}`)
        .send({ location: "Oxenfurt" })
        .expect(200);

      expect(response.body.location).toBe("Oxenfurt");
      const updatedMerchant = await Merchant.findById(merchant!._id);
      expect(updatedMerchant!.location).toBe("Oxenfurt");
    });

    test("Should fail to update with invalid fields", async () => {
      const merchant = await Merchant.findOne({ name: "Hattori" });
      await request(app)
        .patch(`/merchants/${merchant!._id}`)
        .send({ invalidField: "value" })
        .expect(400);
    });

    test("Should return 404 if merchant ID does not exist", async () => {
      await request(app)
        .patch("/merchants/645c1b2f4f1a2567e8d9f000")
        .send({ location: "Oxenfurt" })
        .expect(404);
    });

    test("Should return 500 if merchant ID is invalid", async () => {
      await request(app)
        .patch("/merchants/invalidID")
        .send({ location: "Oxenfurt" })
        .expect(500);
    });
  });

  describe("DELETE /merchants", () => {
    test("Should delete a merchant passing the name by query", async () => {
      const merchant = await Merchant.findOne({ name: "Hattori" });
      await request(app).delete("/merchants?name=Hattori").expect(200);
      const deletedMerchant = await Merchant.findById(merchant!._id);
      expect(deletedMerchant).toBe(null);
    });

    test("Should delete a merchant passing the type by query", async () => {
      const merchant = await Merchant.findOne({ name: "Hattori" });
      await request(app).delete("/merchants?type=Blacksmith").expect(200);
      const deletedMerchant = await Merchant.findById(merchant!._id);
      expect(deletedMerchant).toBe(null);
    });

    test("Should delete a merchant passing the location by query", async () => {
      const merchant = await Merchant.findOne({ name: "Hattori" });
      await request(app).delete("/merchants?location=Novigrad").expect(200);
      const deletedMerchant = await Merchant.findById(merchant!._id);
      expect(deletedMerchant).toBe(null);
    });

    test("Should return 404 if no merchants match the query", async () => {
      await request(app).delete("/merchants?name=Unknown").expect(404);
    });
  });

  describe("DELETE /merchants/:id", () => {
    test("Should delete a merchant by ID", async () => {
      const merchant = await Merchant.findOne({ name: "Hattori" });
      expect(merchant).not.toBe(null);
      await request(app).delete(`/merchants/${merchant!._id}`).expect(200);

      const deletedMerchant = await Merchant.findById(merchant!._id);
      expect(deletedMerchant).toBe(null);
    });

    test("Should return 404 if merchant ID does not exist", async () => {
      await request(app)
        .delete("/merchants/645c1b2f4f1a2567e8d9f000")
        .expect(404);
    });

    test("Should return 500 if merchant ID is invalid", async () => {
      await request(app).delete("/merchants/invalidID").expect(500);
    });
  });
});

// Hunter Tests
describe("Hunter API", () => {
  describe("POST /hunters", () => {
    test("Should successfully create a new hunter", async () => {
      const response = await request(app)
        .post("/hunters")
        .send({
          name: "Triss",
          race: "Mage",
          location: "Novigrad",
        })
        .expect(201);

      expect(response.body).toMatchObject({
        name: "Triss",
        race: "Mage",
        location: "Novigrad",
      });

      const hunterInDb = await Hunter.findById(response.body._id);
      expect(hunterInDb).not.toBe(null);
      expect(hunterInDb!.name).toBe("Triss");
    });

    test("Should fail to create a hunter with duplicate name", async () => {
      await request(app).post("/hunters").send(sampleHunter).expect(500);
    });

    test("Should fail to create a hunter with invalid race", async () => {
      await request(app)
        .post("/hunters")
        .send({
          name: "Yennefer",
          race: "invalid-race",
          location: "Vengerberg",
        })
        .expect(500);
    });
  });

  describe("GET /hunters", () => {
    test("Should get hunters by name in query parameters", async () => {
      const response = await request(app)
        .get("/hunters?name=Geralt")
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleHunter);
    });

    test("Should get hunters by race in query parameters", async () => {
      const response = await request(app)
        .get("/hunters?race=Human")
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleHunter);
    });

    test("Should get hunters by location in query parameters", async () => {
      const response = await request(app)
        .get("/hunters?location=Kaer Morhen")
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleHunter);
    });

    test("Should return 404 if no hunters match the query", async () => {
      await request(app).get("/hunters?name=Unknown").expect(404);
    });
  });

  describe("GET /hunters/:id", () => {
    test("Should get a hunter by ID", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      const response = await request(app)
        .get(`/hunters/${hunter!._id}`)
        .expect(200);

      expect(response.body).toMatchObject(sampleHunter);
    });

    test("Should return 404 if hunter ID does not exist", async () => {
      await request(app).get("/hunters/645c1b2f4f1a2567e8d9f000").expect(404);
    });

    test("Should return 500 if hunter ID is invalid", async () => {
      await request(app).get("/hunters/invalidID").expect(500);
    });
  });

  describe("PATCH /hunters", () => {
    test("Should fail to create a hunter if name query is not provided", async () => {
      await request(app)
        .patch("/hunters")
        .send({ location: "Novigrad" })
        .expect(400);
    });

    test("Should return 404 if no hunters match the query", async () => {
      await request(app)
        .patch("/hunters?name=Unknown")
        .send({ location: "Novigrad" })
        .expect(404);
    });

    test("Should update a hunter passing the name by query", async () => {
      const response = await request(app)
        .patch("/hunters?name=Geralt")
        .send({ location: "Novigrad" })
        .expect(200);

      expect(response.body.location).toBe("Novigrad");

      const updatedHunter = await Hunter.findOne({ name: "Geralt" });
      expect(updatedHunter!.location).toBe("Novigrad");
    });

    test("Should fail to update with invalid fields", async () => {
      await request(app)
        .patch("/hunters?name=Geralt")
        .send({ invalidField: "value" })
        .expect(400);
    });

    test("Should return 404 if hunter does not exist", async () => {
      await request(app)
        .patch("/hunters?name=Unknown")
        .send({ location: "Novigrad" })
        .expect(404);
    });
  });

  describe("PATCH /hunters/:id", () => {
    test("Should update a hunter by ID", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      const response = await request(app)
        .patch(`/hunters/${hunter!._id}`)
        .send({ location: "Novigrad" })
        .expect(200);

      expect(response.body.location).toBe("Novigrad");

      const updatedHunter = await Hunter.findById(hunter!._id);
      expect(updatedHunter!.location).toBe("Novigrad");
    });

    test("Should fail to update with invalid fields", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      await request(app)
        .patch(`/hunters/${hunter!._id}`)
        .send({ invalidField: "value" })
        .expect(400);
    });

    test("Should return 404 if hunter ID does not exist", async () => {
      await request(app)
        .patch("/hunters/645c1b2f4f1a2567e8d9f000")
        .send({ location: "Novigrad" })
        .expect(404);
    });

    test("Should return 500 if hunter ID is invalid", async () => {
      await request(app)
        .patch("/hunters/invalidID")
        .send({ location: "Novigrad" })
        .expect(500);
    });
  });

  describe("DELETE /hunters", () => {
    test("Should delete a hunter passing the name by query", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      await request(app).delete("/hunters?name=Geralt").expect(200);
      const deletedHunter = await Hunter.findById(hunter!._id);
      expect(deletedHunter).toBe(null);
    });

    test("Should delete a hunter passing the race by query", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      await request(app).delete("/hunters?race=Human").expect(200);
      const deletedHunter = await Hunter.findById(hunter!._id);
      expect(deletedHunter).toBe(null);
    });

    test("Should delete a hunter passing the location by query", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      await request(app).delete("/hunters?location=Kaer Morhen").expect(200);
      const deletedHunter = await Hunter.findById(hunter!._id);
      expect(deletedHunter).toBe(null);
    });

    test("Should return 404 if no hunters match the query", async () => {
      await request(app).delete("/hunters?name=Unknown").expect(404);
    });
  });

  describe("DELETE /hunters/:id", () => {
    test("Should delete a hunter by ID", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      await request(app).delete(`/hunters/${hunter!._id}`).expect(200);

      const deletedHunter = await Hunter.findById(hunter!._id);
      expect(deletedHunter).toBe(null);
    });

    test("Should return 404 if hunter ID does not exist", async () => {
      await request(app)
        .delete("/hunters/645c1b2f4f1a2567e8d9f000")
        .expect(404);
    });

    test("Should return 500 if hunter ID is invalid", async () => {
      await request(app).delete("/hunters/invalidID").expect(500);
    });
  });

  // Default tests
  describe("Default API", () => {
    test("Should return 501 for non-existent routes", async () => {
      await request(app).get("/non-existent-route").expect(501);
    });
  });
});
