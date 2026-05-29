function isValidMovie(movie) {
  return (
    movie &&
    typeof movie.title === "string" &&
    movie.title.trim() !== "" &&
    typeof movie.genre === "string" &&
    movie.genre.trim() !== "" &&
    Number.isInteger(movie.year) &&
    Number.isInteger(movie.rating) &&
    movie.rating >= 1 &&
    movie.rating <= 5
  );
}

module.exports = { isValidMovie };