#!/usr/bin/env node

import { getCompanyFromANAF, searchCompany } from "./src/anaf.js";

const args = process.argv.slice(2);

if (args[0] === "search") {
  const brand = args[1] || "SOFTECH";
  console.log(`=== Searching for: ${brand} ===\n`);

  searchCompany(brand)
    .then(results => {
      console.log(`Found ${results.length} results:\n`);
      results.forEach((c, i) => {
        console.log(`${i+1}. ${c.name} (CIF: ${c.cui}) - ${c.statusLabel || 'N/A'}`);
      });
    })
    .catch(err => {
      console.error("Error:", err.message);
      process.exit(1);
    });
} else if (args[0]) {
  const cif = args[0];
  console.log(`=== Fetching company data for CIF: ${cif} ===\n`);

  getCompanyFromANAF(cif)
    .then(data => {
      if (!data) {
        console.log("No data found for CIF:", cif);
        process.exit(1);
      }
      console.log(`Company: ${data.name}`);
      console.log(`CIF: ${data.cui}`);
      console.log(`Status: ${data.inactive ? 'INACTIVE' : 'ACTIVE'}`);
      console.log(`Address: ${data.address || 'N/A'}`);
      console.log(`Registration: ${data.registrationNumber || 'N/A'}`);
      console.log(`CAEN: ${data.caenCode || 'N/A'}`);
      console.log(`VAT Registered: ${data.vatRegistered ? 'Yes' : 'No'}`);
    })
    .catch(err => {
      console.error("Error:", err.message);
      process.exit(1);
    });
} else {
  console.log("Usage:");
  console.log("  node demoanaf.js search <brand>    - Search for companies");
  console.log("  node demoanaf.js <cif>             - Get company details by CIF");
}
