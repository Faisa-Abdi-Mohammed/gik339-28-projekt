const { isValidMovie } = require("./movieValidator");

describe("Movie Validator Unit Test", () => {
  test("ska godkänna en korrekt film", () => {
    const movie = {
      title: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      rating: 5
    };

    expect(isValidMovie(movie)).toBe(true);
  });

  test("ska neka film utan titel", () => {
    const movie = {
      title: "",
      year: 2010,
      genre: "Sci-Fi",
      rating: 5
    };

    expect(isValidMovie(movie)).toBe(false);
  });

  test("ska neka rating utanför 1-5", () => {
    const movie = {
      title: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      rating: 10
    };

    expect(isValidMovie(movie)).toBe(false);
  });
});