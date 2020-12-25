/* セッション */

import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity("Session")
@Index(["ExpiryDateTime"])
@Index(["IdUser"])
export class Session {
  @PrimaryColumn({ type: "char", length: 36, comment: "セッションID" })
  Id!: string;

  @Column({ type: "char", length: 36, comment: "User.Id" })
  IdUser!: string;

  @Column({ type: "datetime2", comment: "有効期限" })
  ExpiryDateTime!: Date;
}
