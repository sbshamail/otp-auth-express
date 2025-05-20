import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export const initWhatsAppClient = async () => {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: "myapp" }),
    // authStrategy: new LocalAuth(),
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr: string) => {
    console.log("Scan this QR code with WhatsApp:");
    qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", () => {
    console.log("✅ Authenticated with WhatsApp");
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ Authentication failure:", msg);
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client is ready!");
  });

  await client.initialize();
  return client;
};
