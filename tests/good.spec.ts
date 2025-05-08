import { describe, test, beforeEach, afterEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Good } from "../src/models/good.model.js";

const sampleGood = {
  name: "Sword",
  description: "Steel sword",
  material: "Steel",
  weight: 2,
  stock: 10,
  value: 100,
};

beforeEach(async () => {
  await Good.deleteMany();
  await new Good(sampleGood).save();
});

afterEach(async () => {
  await Good.deleteMany();
});

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
    expect(response.body).to.include({
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
    const response = await request(app).get("/goods?name=Sword").expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).to.include(sampleGood);
  });

  test("Should return 404 if no goods match the query", async () => {
    await request(app).get("/goods?name=Unknown").expect(404);
  });
});

describe("GET /goods/:id", () => {
  test("Should get a good by ID", async () => {
    const good = await Good.findOne({ name: "Sword" });
    const response = await request(app).get(`/goods/${good!._id}`).expect(200);

    expect(response.body).to.include(sampleGood);
  });

  test("Should return 404 if good ID does not exist", async () => {
    await request(app).get("/goods/645c1b2f4f1a2567e8d9f000").expect(404);
  });
});

describe("PATCH /goods/:id", () => {
  test("Should update a good by ID", async () => {
    const good = await Good.findOne({ name: "Sword" });
    const response = await request(app)
      .patch(`/goods/${good!._id}`)
      .send({ stock: 5 })
      .expect(200);

    expect(response.body.stock).to.equal(5);

    const updatedgood = await Good.findById(good!._id);
    expect(updatedgood!.stock).to.equal(5);
  });

  test("Should fail to update with invalid fields", async () => {
    const good = await Good.findOne({ name: "Sword" });
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
    const good = await Good.findOne({ name: "Sword" });
    await request(app).delete(`/goods/${good!._id}`).expect(200);

    const deletedgood = await Good.findById(good!._id);
    expect(deletedgood).toBe(null);
  });

  test("Should return 404 if good ID does not exist", async () => {
    await request(app).delete("/goods/645c1b2f4f1a2567e8d9f000").expect(404);
  });
});
