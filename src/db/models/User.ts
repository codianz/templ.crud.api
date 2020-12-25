/* ユーザー */

import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity("User")
@Index(["RegisterDateTime", "IsEnabled", "UserName"])
export class User {
  @PrimaryColumn({ type: "char", length: 36, comment: "ID" })
  Id!: string;

  @Column({ type: "datetime2", comment: "登録日時" })
  RegisterDateTime!: Date | string;

  @Column({ type: "bit", comment: "有効" })
  IsEnabled!: boolean;

  @Column({ type: "nvarchar", length: 256, comment: "ユーザ名" })
  UserName!: string;

  @Column({ type: "nvarchar", length: 256, comment: "パスワード" })
  PasswordHash!: string;
}
