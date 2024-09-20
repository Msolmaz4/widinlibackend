const express = require("express");
const app = express();

require("dotenv").config();
const PORT = process.env?.PORT || 8000;

const cors = require("cors");

app.use(cors());
// Connect to DB:
const { dbConnection } = require("./db/db");
dbConnection();

app.use(express.json());

//app.use(express.urlencoded({ extended: false}))
app.use(express.urlencoded({ extended: true }));
const authRouter  = require("./router/authrouter")
//app.use(require("./src/routers"));

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
app.use('/auth',authRouter)
//? RUN SERVER:
app.listen(PORT, () => console.log("http://127.0.0.1:" + PORT));
