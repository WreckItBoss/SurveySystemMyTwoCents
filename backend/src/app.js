import express from "express";
import cors from "cors";
import responseRoutes from "./routes/responseRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);


app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/responses", responseRoutes);
app.use("/api/sessions", sessionRoutes);

export default app;