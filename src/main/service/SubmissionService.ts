import { getManager } from "typeorm";
import {
  Submission,
  SubmissionCategory
} from "@/main/database/entities/Submission";
import { Submission as FaSubmission } from "furaffinity-api/dist/interfaces";

export const findSubmissionById = (id: string) => {
  return getManager().findOne(Submission, { id });
};

export const createSubmissionFromFaSubmission = (
  faSubmission: FaSubmission,
  category: SubmissionCategory
) => {
  const entity = new Submission(
    faSubmission.id,
    faSubmission.author.id,
    faSubmission.downloadUrl,
    category
  );
  return getManager().save(Submission, entity);
};
