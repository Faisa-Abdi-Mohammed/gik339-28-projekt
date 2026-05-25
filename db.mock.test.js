jest.mock("./server/db", () => ({
  all: jest.fn((sql, callback) => {
    callback(null, [
      {
        id: 1,
        title: "Mock Movie",
        year: 2020,
        genre: "Drama",
        rating: 4
      }
    ]);
  }),

  run: jest.fn(function (sql, params, callback) {
    callback.call({ lastID: 1, changes: 1 }, null);
  })
}));

const request = require("supertest");
const app = require("./server/server");
const db = require("./server/db");

describe("Movie API med mockad databas", () => {
  test("GET /movies använder mockad db.all", async () => {
    const response = await request(app).get("/movies");

    expect(response.statusCode).toBe(200);
    expect(response.body[0].title).toBe("Mock Movie");
    expect(db.all).toHaveBeenCalled();
  });

  test("POST /movies använder mockad db.run", async () => {
    const movie = {
      title: "Mock Test",
      year: 2024,
      genre: "Action",
      rating: 5
    };

    const response = await request(app)
      .post("/movies")
      .send(movie);

    expect(response.statusCode).toBe(201);
    expect(db.run).toHaveBeenCalled();
  });
});