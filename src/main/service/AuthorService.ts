import { getManager } from "typeorm";
import { Author } from "../database/entities/Author";

export const findAuthorById = (id: string) => {
  return getManager().findOne(Author, { id });
};
