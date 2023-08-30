import express from "express";
import fs from "fs";
import connection from "./db/connection.js";
// import path from "path";

import userRouter from "./modules/users/users.routes.js";
import taskRouter from "./modules/tasks/tasks.routes.js";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.listen(8080, () => {
    console.log(`Server is running on http://localhost:8080`);
});
app.use(userRouter);
app.use(taskRouter);
connection();

const home = (req, res) => {
    fs.readFile("index.html", "utf8", (err, data) => {
        if (err) {
            console.error("Error reading HTML file:", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        res.send(data);
    });
};
app.get("/", home);
