import { describe, test, beforeEach, afterEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Transaction } from "../src/models/transaction.model.js";
import { Good } from "../src/models/good.model.js";
import { Hunter } from "../src/models/hunter.model.js";
import { Merchant } from "../src/models/merchant.model.js";

const sampleHunter = {
  name: "Geralt",
  race: "Human",
  location: "Kaer Morhen",
};

const sampleHunter2 = {
  name: "Yennefer",
  race: "Human",
  location: "Vengerberg",
};

const sampleMerchant = {
  name: "Hattori",
  type: "Blacksmith",
  location: "Novigrad",
};

const sampleMerchant2 = {
  name: "Zoltan",
  type: "General",
  location: "Vergen",
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
    goodDetails: [{ goodId: good._id, amount: 2 }],
    type: "Buy",
    transactionValue: 1500,
  }).save();

  await new Transaction({
    involvedID: merchant._id,
    involvedType: "Merchant",
    goodDetails: [{ goodId: good._id, amount: 5 }],
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
          type: "Buy"
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
      await request(app)
        .get(`/transactions/${transaction!._id}`)
        .expect(200);
    });

    test("Should return 404 if transaction ID does not exist", async () => {
      await request(app).get("/transactions/645c1b2f4f1a2567e8d9f000").expect(404);
    });
  });

  describe("PATCH /transactions/:id", () => {
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
      const response = await request(app).get("/goods?name=Silver Sword").expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(sampleGood);
    });

    test("Should all goods with steel material", async () => {
      await new Good(sampleGood2).save();
      const response = await request(app).get("/goods?material=Steel").expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject(sampleGood);
      expect(response.body[1]).toMatchObject(sampleGood2);
    });

    test("Should return Silver Sword searching by description and material", async () => {
      await new Good(sampleGood2).save();
      const response = await request(app)
        .get("/goods?description=A sword made of silver effective against monsters&material=Steel")
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
      const response = await request(app).get(`/goods/${good!._id}`).expect(200);

      expect(response.body).toMatchObject(sampleGood);
    });

    test("Should return 404 if good ID does not exist", async () => {
      await request(app).get("/goods/645c1b2f4f1a2567e8d9f000").expect(404);
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
    test("Should get merchants by query parameters", async () => {
      const response = await request(app)
        .get("/merchants?name=Hattori")
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
      const response = await request(app).get(`/merchants/${merchant!._id}`).expect(200);

      expect(response.body).toMatchObject(sampleMerchant);
    });

    test("Should return 404 if merchant ID does not exist", async () => {
      await request(app).get("/merchants/645c1b2f4f1a2567e8d9f000").expect(404);
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
      await request(app).delete("/merchants/645c1b2f4f1a2567e8d9f000").expect(404);
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
    test("Should get hunters by query parameters", async () => {
      const response = await request(app).get("/hunters?name=Geralt").expect(200);

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
  });

  describe("DELETE /hunters/:id", () => {
    test("Should delete a hunter by ID", async () => {
      const hunter = await Hunter.findOne({ name: "Geralt" });
      await request(app).delete(`/hunters/${hunter!._id}`).expect(200);

      const deletedHunter = await Hunter.findById(hunter!._id);
      expect(deletedHunter).toBe(null);
    });

    test("Should return 404 if hunter ID does not exist", async () => {
      await request(app).delete("/hunters/645c1b2f4f1a2567e8d9f000").expect(404);
    });
  });
});