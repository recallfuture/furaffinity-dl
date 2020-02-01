const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const { Config, Log, Subscription, Task } = require("../entity");
const { Init1580536212346 } = require("../migration/1580536212346-Init");
const {
  addConfig1580541830560
} = require("../migration/1580541830560-add-config");

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

  entities: [Config, Log, Subscription, Task],
  migrations: [Init1580536212346, addConfig1580541830560],
  migrationsRun: true,

  cli: {
    entitiesDir: "src/main/database/entity",
    migrationsDir: "src/main/database/migration"
  }
};
