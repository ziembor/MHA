/**
 * Installs HTTPS dev certificates into the system trust store.
 *
 * On Windows, office-addin-dev-certs uses PowerShell scripts that can hang
 * waiting for a security dialog when adding/removing root CA certificates.
 * This script bypasses that by using certutil.exe instead, which operates
 * silently on the CurrentUser\Root store without a UI prompt.
 */

import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
    isCaCertificateInstalled,
    generateCertificates,
} = require("office-addin-dev-certs");

const certDir = path.join(os.homedir(), ".office-addin-dev-certs");
const caCertPath = path.join(certDir, "ca.crt");
const localhostCertPath = path.join(certDir, "localhost.crt");
const localhostKeyPath = path.join(certDir, "localhost.key");
const CA_CERT_NAME = "Developer CA for Microsoft Office Add-ins";

const certFilesExist =
    fs.existsSync(caCertPath) &&
    fs.existsSync(localhostCertPath) &&
    fs.existsSync(localhostKeyPath);

if (certFilesExist && isCaCertificateInstalled()) {
    console.log("Dev certificates are already installed and trusted.");
    process.exit(0);
}

console.log("Setting up dev certificates for HTTPS...");

// Remove stale cert files so generateCertificates creates fresh ones
if (fs.existsSync(certDir)) {
    for (const f of [caCertPath, localhostCertPath, localhostKeyPath]) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
    }
}

if (process.platform === "win32") {
    // Remove any previously installed CA cert from the trust store (ignore errors if not present)
    try {
        execSync(`certutil -delstore -user Root "${CA_CERT_NAME}"`, { stdio: "pipe" });
    } catch {
        // Not present — that's fine
    }

    await generateCertificates(caCertPath, localhostCertPath, localhostKeyPath);
    console.log("Certificate files generated.");

    execSync(`certutil -addstore -user Root "${caCertPath}"`, { stdio: "inherit" });
} else {
    const { installCaCertificate, uninstallCaCertificate } = require("office-addin-dev-certs");
    await uninstallCaCertificate(false, false).catch(() => {});
    await generateCertificates(caCertPath, localhostCertPath, localhostKeyPath);
    console.log("Certificate files generated.");
    await installCaCertificate(caCertPath);
}

console.log("HTTPS dev server certificates are ready.");
