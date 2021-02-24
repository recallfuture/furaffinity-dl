import { Column, Entity, PrimaryColumn } from "typeorm";

export enum SubmissionCategory {
  Gallery = "gallery",
  Scraps = "scraps"
}

@Entity("submissions")
export class Submission {
  constructor(
    id: string,
    authorId: string,
    downloadUrl: string,
    category: SubmissionCategory
  ) {
    this.id = id;
    this.authorId = authorId;
    this.downloadUrl = downloadUrl;
    this.category = category;
  }

  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar", {
    name: "author_id"
  })
  authorId: string;

  @Column("varchar")
  downloadUrl: string;

  @Column("varchar")
  category: SubmissionCategory;

  @Column("varchar")
  gid?: string;

  @Column("varchar", { name: "file_path", nullable: true })
  filePath?: string;
}
