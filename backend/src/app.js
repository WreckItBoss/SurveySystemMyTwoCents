import express from "express";
import cors from "cors";

import responseRoutes from "./routes/responseRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header
      // such as curl or server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS blocked origin: ${origin}`,
        ),
      );
    },
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use(
  "/api/responses",
  responseRoutes,
);

app.use(
  "/api/sessions",
  sessionRoutes,
);

export default app;