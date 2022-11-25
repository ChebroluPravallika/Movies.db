const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");
const app = express();

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: databasePath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `select movie_name from movie;`;
  const getMoviesListQueryResponse = await db.all(getMoviesListQuery);
  response.send(
    getMoviesListQueryResponse.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const getMovies = `insert into movie (director_id,movie_name,lead_actor) 
    values('${directorId}','${movieName}', '${leadActor}' );`;
  const moviesArray = await db.run(getMovies);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `select * from movie where movie_id = ${movieId};`;
  const getMovieDetailsQueryResponse = await db.get(getMovieDetailsQuery);
  response.send(convertDbObjectToResponseObject1(getMovieDetailsQueryResponse));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const getMovies = `update movie set director_id = '${directorId}',movie_name = '${movieName}'
  ,lead_actor =  '${leadActor}' where movie_id = '${movieId}';`;
  const moviesArray = await db.run(getMovies);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovies = `delete from movie where movie_id =${movieId}`;
  const moviesArray = await db.run(getMovies);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  //const {director_id,director_name} = request.body;
  const director = `select * from director;`;
  const moviesArray = await db.all(director);
  response.send(
    moviesArray.map((each) => convertDbObjectToResponseObject2(each))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovies = `select movie_name from movie where director_id = ${directorId};`;
  const moviesArray = await db.all(getMovies);
  response.send(
    moviesArray.map((each) => convertDbObjectToResponseObject1(each))
  );
});

module.exports = app;
