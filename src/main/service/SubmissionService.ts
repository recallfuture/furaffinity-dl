import { getManager, In } from "typeorm";
import {
  Submission,
  SubmissionCategory,
} from "@/main/database/entities/Submission";
import { Submission as FaSubmission } from "furaffinity-api/dist/interfaces";

export const findSubmissionById = (id: string): Promise<Submission> => {
  return getManager().findOneOrFail(Submission, { id });
};

export const findSubmissionsIn = (idList: string[]): Promise<Submission[]> => {
  return getManager().find(Submission, {
    id: In(idList),
  });
};

export const createSubmissionFromFaSubmission = (
  faSubmission: FaSubmission,
  category: SubmissionCategory
): Promise<Submission> => {
  const entity = new Submission(
    faSubmission.id,
    faSubmission.author.id,
    faSubmission.downloadUrl,
    category
  );
  return getManager().save(Submission, entity);
};
