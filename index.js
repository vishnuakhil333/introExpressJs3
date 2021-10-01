const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
app.use(function (req, res, next) {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://29eng.csb.app/"
//   ); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
  res.set({
        'Access-Control-Allow-Origin': 'https://29eng.csb.app/',
        'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
  next();
});

const dbPath = path.join(__dirname, "goodreads.db");
console.log(dbPath);

let db = null;
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const getBook = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const book = await db.get(getBook);
  console.log(book);
  console.log(bookId);
  response.send(book);
});

//Create a new Book - "POST API"
app.post("/books/", async (req, resp) => {
  const bookDetails = req.body;
  console.log(bookDetails);

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const postBookQuery = `
        INSERT INTO 
        book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
        values (
            '${title}',
            ${authorId},
            ${rating},
            ${ratingCount},
            ${reviewCount},
            '${description}',
            ${pages},
            '${dateOfPublication}',
            '${editionLanguage}',
            ${price},
            '${onlineStores}'
        );
        `;
  console.log(postBookQuery);
  const bookId = await db.run(postBookQuery);
  //   console.log(dbResponse.lastID);
  resp.send({ bookId: bookId });
});

//Update book
app.put("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const book = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = book;
  const updateQuery = `
        UPDATE 
            book
        SET
            title='${title}',
            author_id=${authorId},
            rating=${rating},
            rating_count=${ratingCount},
            review_count=${reviewCount},
            description='${description}',
            pages=${pages},
            date_of_publication='${dateOfPublication}',
            edition_language='${editionLanguage}',
            price=${price},
            online_stores='${onlineStores}'
        WHERE book_id = '${bookId}';
    `;
  const dbResponse = await db.run(updateQuery);
  console.log(dbResponse);
  response.send("Book Successfully Updated");
});

app.delete("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const deleteQuery = `
        DELETE FROM book
        WHERE book_id = ${bookId};
    `;
  const dbResponse = await db.run(deleteQuery);
  console.log(dbResponse);
  response.send("Book Deleted successfully");
});

app.post("/ratings", async (req, res) => {
  const { token, animeId, rating, description } = req.body;
  const query = `
        INSERT INTO ratings_info (
            token,anime_id,rating,description
        ) values (
            '${token}',
            ${animeId},
            ${rating},
            '${description}'
        )
    ;`;
  try {
    const response = await db.run(query);
    console.log("error occured after this");
    res.send("Review added with id", response.id, "added");
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/ratings", async (req, res) => {
  const query = `
        SELECT * FROM RATINGS_INFO;
    `;
  let reviews;
  try {
    reviews = await db.all(query);
    res.send(reviews);
    //what if the list is empty
  } catch (error) {
    console.log(error);
  }
});

// INSERT INTO ratings_info (
//             token,anime_id,rating,description
//         ) values (
//             'token',
//             3886,
//             4.5,
//             'description'
//         )
//     ;

// create table ratings_info(
//     id integer primary key,
//     token varchar(1000),
//     anime_id int,
//     rating float,
//     description varchar(500)
// );
