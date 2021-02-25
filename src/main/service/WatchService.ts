import { getManager } from "typeorm";
import { Watch } from "../database/entities/Watch";

export const findWatchByIdAndAuthorId = (id: string, authorId: string) => {
  return getManager().findOne(Watch, { id, authorId });
};
