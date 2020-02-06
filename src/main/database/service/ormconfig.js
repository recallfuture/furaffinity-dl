const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const entities = Object.values(require("../entity"));
const migrations = Object.values(require("../migration"));

const basePath =
  process.env.NODE_ENV === "production"
    ? path.join(app.getPath("documents"), "Furaffinity-dl")
    : ".";

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath);
}

module.exports = {
  type: "sqlite",
  database: path.join(basePath, "database.db"),

  entities: entities,
  migrations: migrations,
  migrationsRun: true,

  cli: {
    entitiesDir: "src/main/database/entity",
    migrationsDir: "src/main/database/migration"
  }
};
