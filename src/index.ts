import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 3000;
const db = process.env.DB as string;

(async () => {
  await connectDB(db);
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
})();
