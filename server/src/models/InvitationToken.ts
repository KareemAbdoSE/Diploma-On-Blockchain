// src/models/InvitationToken.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';
import { University } from './University';

@Table({
  tableName: 'invitation_tokens',
  timestamps: false,
})
export class InvitationToken extends Model {
  @ForeignKey(() => University)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  universityId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  token!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @BelongsTo(() => University)
  university!: University;
}

export default InvitationToken;
