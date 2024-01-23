import { spectoda } from "./communication";
import { logging } from "./lib/spectoda-js/logging";
import fs from "fs";
const { exec } = require('child_process'); // Add this line at the beginning of your file

let printerSerialNumber: string | undefined = undefined;

export function PWS_getSerialPrinterNumber() {
    return printerSerialNumber;
}

export function PWS_initiliaze() {

    const moonrakerConfPath = "/home/pi/printer_data/config/moonraker.conf";
    const moonrakerConfData = fs.readFileSync(moonrakerConfPath, 'utf8');
    const firstLine = moonrakerConfData.split('\n')[0];

    if (firstLine.startsWith('#')) {
        const potentialSerial = firstLine.slice(1);
        const regex = /^[A-Z]{2}\d{5}$/;
        if (regex.test(potentialSerial)) {
            printerSerialNumber = potentialSerial;
        } else {
            logging.error('Serial number format is incorrect');
        }
    } else {
        logging.error('Unexpected format in the first line');
    }


}

export function PWS_enableSupport() {
    try {
        spectoda.enableRemoteControl({ signature: spectoda.getOwnerSignature(), key: spectoda.getOwnerKey(), meta: { printerSerialNumber: printerSerialNumber }, sessionOnly: true });
    } catch (error) {
        logging.error("PWS_enableSupport() ERROR:", error);
    }
}

export function PWS_afterConnect() {

    return new Promise(async (resolve, reject) => {
        try {
            // Use the printerSerialNumber variable here
            if (printerSerialNumber) {
                logging.info(`>> Printer serial number is: ${printerSerialNumber}`);

                const controllerName = await spectoda.readControllerName();

                if (controllerName !== printerSerialNumber) {
                    logging.info(">> Updating Controller '" + controllerName + "' to '" + printerSerialNumber + "'");
                    await spectoda.writeControllerName(printerSerialNumber);
                }

            } else {
                logging.error('Printer serial number could not be determined');
            }

            logging.info("Restarting moonraker-spectoda-connector.service...");
            // Add the following lines at the end of the main function
            exec('systemctl restart moonraker-spectoda-connector.service', (error: any, stdout: any, stderr: any) => {
                if (error) {
                    logging.error(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    logging.error(`Stderr: ${stderr}`);
                    return;
                }
            });

        } catch (error) {
            logging.error("PWS_afterConnect() ERROR:", error);
        }

        resolve(null);
    });
}