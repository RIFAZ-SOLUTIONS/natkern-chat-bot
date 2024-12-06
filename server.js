import express from "express";
import routes from "./routes/routes.js";
import "./config/config.js";

const app = express();
app.use(express.json());

routes(app); // Register routes

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
