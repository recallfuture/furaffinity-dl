import { getManager } from "typeorm";
import { Watch } from "../database/entities/Watch";

export const findWatchByIdAndAuthorId = (
  id: string,
  authorId: string
): Promise<Watch> => {
  return getManager().findOneOrFail(Watch, { id, authorId });
};
