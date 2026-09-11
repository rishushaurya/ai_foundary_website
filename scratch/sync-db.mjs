import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

// Now import local-db after process.env is configured
const { writeData, readData } = await import("../src/lib/local-db.ts");

const DATA_DIR = path.join(process.cwd(), "data");

async function sync() {
  const files = [
    "hackathon-events.json",
    "hackathon-rounds.json",
    "hackathon-criteria.json",
    "hackathon-teams.json",
    "hackathon-judges.json",
    "hackathon-scores.json",
    "hackathon-votes.json",
    "hackathon-tiebreakers.json",
    "hackathon-logs.json",
  ];

  for (const f of files) {
    const filePath = path.join(DATA_DIR, f);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      await writeData(f, data);
      console.log(`Synced ${f} to Upstash Redis.`);
    }
  }

  // Verify Upstash Redis read for scores
  const scoresFromRedis = await readData("hackathon-scores.json", []);
  console.log(`Verified Upstash Redis contains ${scoresFromRedis.length} scores.`);
  const roundsFromRedis = await readData("hackathon-rounds.json", []);
  console.log(`Verified Upstash Redis contains ${roundsFromRedis.length} rounds.`);
  console.log(`Round 1 status in Redis: ${roundsFromRedis[0]?.status}`);
}

sync().then(() => {
  console.log("Database and Redis fully synchronized!");
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
