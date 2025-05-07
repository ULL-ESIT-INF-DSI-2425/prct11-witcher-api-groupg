import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { Merchant } from "../src/models/merchant.model.js";

const sampleMerchant = {
  name: "Hattori",
  type: "Herrero",
  location: "Novigrad",
};

beforeEach(async () => {
  await Merchant.deleteMany();
  await new Merchant(sampleMerchant).save();
});

describe("POST /merchant", () => {
  test("Should successfully create a new merchant", async () => {
    const response = await request(app)
      .post("/merchant")
      .send({
        name: "Zoltan",
        type: "General",
        location: "Vergen",
      })
      .expect(201);

    expect(response.body).to.include({
      name: "Zoltan",
      type: "General",
      location: "Vergen",
    });
    
    const merchantInDb = await Merchant.findById(response.body._id);
    expect(merchantInDb).not.toBe(null);
    expect(merchantInDb!.name).to.equal("Zoltan");
  });

  test("Should fail to create a merchant with duplicate name", async () => {
    await request(app).post("/merchant").send(sampleMerchant).expect(400);
  });

  test("Should fail to create a merchant with invalid type", async () => {
    await request(app)
      .post("/merchant")
      .send({
        name: "Dandelion",
        type: "invalid-type",
        location: "Oxenfurt",
      })
      .expect(400);
  });
});

describe("GET /merchant", () => {
  test("Should get merchants by query parameters", async () => {
    const response = await request(app)
      .get("/merchant?name=Hattori")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).to.include(sampleMerchant);
  });

  test("Should return 404 if no merchants match the query", async () => {
    await request(app).get("/merchant?name=Unknown").expect(404);
  });
});

describe("GET /merchant/:id", () => {
  test("Should get a merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: "Hattori" });
    const response = await request(app).get(`/merchant/${merchant!._id}`).expect(200);

    expect(response.body).to.include(sampleMerchant);
  });

  test("Should return 404 if merchant ID does not exist", async () => {
    await request(app).get("/merchant/645c1b2f4f1a2567e8d9f000").expect(404);
  });
});

describe("PATCH /merchant/:id", () => {
  test("Should update a merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: "Hattori" });
    const response = await request(app)
      .patch(`/merchant/${merchant!._id}`)
      .send({ location: "Oxenfurt" })
      .expect(200);

    expect(response.body.location).to.equal("Oxenfurt");

    const updatedMerchant = await Merchant.findById(merchant!._id);
    expect(updatedMerchant!.location).to.equal("Oxenfurt");
  });

  test("Should fail to update with invalid fields", async () => {
    const merchant = await Merchant.findOne({ name: "Hattori" });
    await request(app)
      .patch(`/merchant/${merchant!._id}`)
      .send({ invalidField: "value" })
      .expect(400);
  });

  test("Should return 404 if merchant ID does not exist", async () => {
    await request(app)
      .patch("/merchant/645c1b2f4f1a2567e8d9f000")
      .send({ location: "Oxenfurt" })
      .expect(404);
  });
});

describe("DELETE /merchant/:id", () => {
  test("Should delete a merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: "Hattori" });
    expect(merchant).not.toBe(null);
    await request(app).delete(`/merchant/${merchant!._id}`).expect(200);

    const deletedMerchant = await Merchant.findById(merchant!._id);
    expect(deletedMerchant).toBe(null);
  });

  test("Should return 404 if merchant ID does not exist", async () => {
    await request(app).delete("/merchant/645c1b2f4f1a2567e8d9f000").expect(404);
  });
});