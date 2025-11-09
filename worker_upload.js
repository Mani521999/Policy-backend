import xlsx from "xlsx";
import fs from "fs";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

import { connectDB } from "./db/index.js";
import Agent from "./models/Agent.js";
import User from "./models/User.js";
import Carrier from "./models/Carrier.js";
import LOB from "./models/Lob.js";
import Policy from "./models/Policy.js";
import UserAccount from "./models/UserAccount.js";

dotenv.config();

const BATCH_SIZE = 1000;
const bulkPolicies = [];

process.on("message", async ({ filePath }) => {
  try {
    console.log("Worker process started:", filePath);

    await connectDB();

    const ext = filePath.split(".").pop().toLowerCase();
    let rows;

    if (ext === "xlsx" || ext === "xls") {
      const wb = xlsx.readFile(filePath);
      rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    } else {
      rows = parse(fs.readFileSync(filePath), { columns: true });
    }

    let count = 0;

    for (const r of rows) {
      try {
        const user = await User.findOneAndUpdate(
          { email: r.email },
          {
            firstName: r.producer,
            dob: new Date(r.dob),
            address: r.address,
            phone: r.phone,
            state: r.state,
            zip: r.zip,
            email: r.email,
            gender: r.gender,
            userType: r.userType,
          },
          { upsert: true, new: true }
        );

        // Agent
        const agent = await Agent.findOneAndUpdate(
          { name: r.agent },
          { name: r.agent },
          { upsert: true, new: true }
        );

        // Carrier
        const carrier = await Carrier.findOneAndUpdate(
          { company_name: r.company_name },
          { company_name: r.company_name },
          { upsert: true, new: true }
        );

        // LOB
        const lob = await LOB.findOneAndUpdate(
          { category_name: r.category_name },
          { category_name: r.category_name },
          { upsert: true, new: true }
        );

        // User Account
        await UserAccount.findOneAndUpdate(
          { accountName: r.account_name, user: user._id },
          { accountName: r.account_name, user: user._id },
          { upsert: true }
        );

        bulkPolicies.push({
          updateOne: {
            filter: { policyNumber: r.policy_number },
            update: {
              $set: {
                policyNumber: r.policy_number,
                startDate: new Date(r.policy_start_date),
                endDate: new Date(r.policy_end_date),
                policyCategory: r.policy_type,
                collectionId: r["Applicant ID"],
                companyCollectionId: r.agency_id,
                premiumAmount: parseFloat(r.premium_amount) || 0,
                producer: r.producer,
                user: user._id,
                carrier: carrier._id,
                lob: lob._id,
                agent: agent._id,
              },
            },
            upsert: true,
          },
        });

        if (bulkPolicies.length >= BATCH_SIZE) {
          await Policy.bulkWrite(bulkPolicies);
          bulkPolicies.length = 0;
        }

        count++;
      } catch (err) {
        console.error("❌ Row error:", err.message);
      }
    }

    if (bulkPolicies.length > 0) {
      await Policy.bulkWrite(bulkPolicies);
    }

    console.log(`✅ Worker finished. ${count} records processed.`);
    process.send({ status: "done", result: { inserted: count } });
    process.exit(0);
  } catch (err) {
    console.error("❌ Worker failed:", err.message);
    process.send({ status: "error", error: err.message });
    process.exit(1);
  }
});
