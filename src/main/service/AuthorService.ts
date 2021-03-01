import { getManager } from "typeorm";
import { Author } from "../database/entities/Author";

export const findAuthorById = async (id: string) => {
  const entity = await getManager().findOneOrFail(Author, { id });
  if (!entity) {
    throw new Error(`作者不存在：${id}`);
  }
  return entity;
};
