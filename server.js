import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connect from "./database/connect.js";
import router from "./router/route.js";
import { globalErrHandler, notFound } from "./middlewares/globalErrHandler.js";

dotenv.config();

const app = express();

// ! Middlwares
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by"); // * Less hackers know about our stack

const port = 8049;

// ! HTTP GET request
app.get("/", (request, response) => {
  response.status(201).json("Home GET Request");
});

// ! api routes
app.use("/api", router);

// ! error middleware
app.use(notFound);
app.use(globalErrHandler);

// TODO: start server only when we have valid connection
connect()
  .then(() => {
    try {
      // ! Start server
      app.listen(port, () => {
        console.log(`Server connected to http://localhost:${port}`);
      });
    } catch (error) {
      console.log("Cannot connect to the server");
    }
  })
  .catch((error) => {
    console.log("Invalid database connection");
  });
