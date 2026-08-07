import express from "express";
import cors from "cors";
import responseRoutes from "./routes/responseRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/responses", responseRoutes);

export default app;