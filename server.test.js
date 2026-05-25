const request = require("supertest");
const app = require("./server/server");

describe("Movie API", () => {

  test("GET /movies ska returnera status 200", async () => {

    const response = await request(app).get("/movies");

    expect(response.statusCode).toBe(200);

  });

  test("POST /movies ska skapa en ny film", async () => {

    const newMovie = {
      title: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      rating: 5
    };

    const response = await request(app)
      .post("/movies")
      .send(newMovie);

    expect(response.statusCode).toBe(201);

    expect(response.body.message).toBe("Film skapad!");

  });

  test("POST /movies ska returnera 400 vid felaktig data", async () => {

    const invalidMovie = {
      title: "",
      year: "fel",
      genre: "",
      rating: 10
    };

    const response = await request(app)
      .post("/movies")
      .send(invalidMovie);

    expect(response.statusCode).toBe(400);

  });

});
test("PUT /movies ska uppdatera en film", async () => {

  const movie = {
    title: "Matrix",
    year: 1999,
    genre: "Action",
    rating: 5
  };

  const createResponse = await request(app)
    .post("/movies")
    .send(movie);

  const movieId = createResponse.body.id;

  const updatedMovie = {
    id: movieId,
    title: "Matrix Reloaded",
    year: 2003,
    genre: "Sci-Fi",
    rating: 4
  };

  const response = await request(app)
    .put("/movies")
    .send(updatedMovie);

  expect(response.statusCode).toBe(200);

});

test("DELETE /movies/:id ska ta bort en film", async () => {

  const movie = {
    title: "Titanic",
    year: 1997,
    genre: "Drama",
    rating: 5
  };

  const createResponse = await request(app)
    .post("/movies")
    .send(movie);

  const movieId = createResponse.body.id;

  const response = await request(app)
    .delete(`/movies/${movieId}`);

  expect(response.statusCode).toBe(200);

});