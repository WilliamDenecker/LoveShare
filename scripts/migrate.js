const fs = require("fs");
const path = require("path");

const sqlPath = path.join(__dirname, "..", "sql", "001_initial_schema.sql");
const content = fs.readFileSync(sqlPath, "utf8");

console.log("Migration file ready:");
console.log(sqlPath);
console.log("Apply the following SQL using the Supabase SQL Editor or psql:");
console.log("\n" + content);
