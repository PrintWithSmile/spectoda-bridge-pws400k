import { spectodaDevice } from "./communication";
import { logging } from "./lib/spectoda-js/Logging";
import { sleep } from "./lib/spectoda-js/functions";
import "./server";
import fs from "fs";

async function main() {

  await sleep(1000);

  if (fs.existsSync("assets/mac.txt")) {
    const mac = fs.readFileSync("assets/mac.txt").toString();
    logging.info("Connecting to remembered device with MAC: " + mac);

    try {
      // @ts-ignore
      await spectodaDevice.connect([{ mac: mac }], true, null, null, false, "", true);
    } catch {
      logging.error("Failed to connect to remembered device with MAC: " + mac);
    }
  }
}

main();
