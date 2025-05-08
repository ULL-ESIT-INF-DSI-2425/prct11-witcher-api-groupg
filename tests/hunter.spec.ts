import { describe, test, beforeEach, afterEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Hunter } from "../src/models/hunter.model.js";

const sampleHunter = {
  name: "Geralt",
  race: "Cazador",
  location: "Kaer Morhen",
};

beforeEach(async () => {
  await Hunter.deleteMany();
  await new Hunter(sampleHunter).save();
});

afterEach(async () => {
  await Hunter.deleteMany();
});

describe("POST /hunters", () => {
  test("Should successfully create a new hunter", async () => {
    const response = await request(app)
      .post("/hunters")
      .send({
        name: "Triss",
        race: "Hechicero",
        location: "Novigrad",
      })
      .expect(201);

    expect(response.body).to.include({
      name: "Triss",
      race: "Hechicero",
      location: "Novigrad",
    });

    const hunterInDb = await Hunter.findById(response.body._id);
    expect(hunterInDb).not.toBe(null);
    expect(hunterInDb!.name).to.equal("Triss");
  });

  test("Should fail to create a hunter with duplicate name", async () => {
    await request(app).post("/hunters").send(sampleHunter).expect(400);
  });

  test("Should fail to create a hunter with invalid race", async () => {
    await request(app)
      .post("/hunters")
      .send({
        name: "Yennefer",
        race: "invalid-race",
        location: "Vengerberg",
      })
      .expect(400);
  });
});

describe("GET /hunters", () => {
  test("Should get hunters by query parameters", async () => {
    const response = await request(app).get("/hunters?name=Geralt").expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).to.include(sampleHunter);
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

    expect(response.body).to.include(sampleHunter);
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

    expect(response.body.location).to.equal("Novigrad");

    const updatedHunter = await Hunter.findById(hunter!._id);
    expect(updatedHunter!.location).to.equal("Novigrad");
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
