import app from "./app";
import { connectDB } from "./config/db";
import { initWhatsAppClient } from "./config/whatsappClient";
import { db, PORT } from "./config";

(async () => {
  await connectDB(db);
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });

  // Start WhatsApp client in background
  initWhatsAppClient().catch((err) => {
    console.error("❌ WhatsApp client failed to initialize", err);
  });
})();
