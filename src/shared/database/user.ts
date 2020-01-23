import { find, findOne, insert, updateOrAdd, remove } from "./api";
import logger from "@/main/logger";
import { Author } from "furaffinity-api/dist/interfaces";

export async function get() {
  const query = {
    type: "User"
  };
  const result: any = await findOne(query);
  logger.info("Get user", result);
  return result?.data;
}

export async function set(data: Author) {
  const query = {
    type: "User"
  };
  return await updateOrAdd(query, { type: "User", data });
}

export default {
  get,
  set
};
