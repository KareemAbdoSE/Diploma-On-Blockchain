// src/models/Template.ts

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import University from './University';

export interface TemplateAttributes {
  id: number;
  universityId: number;
  templateName: string;
  filePath: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateCreationAttributes
  extends Omit<TemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({
  tableName: 'templates',
  timestamps: true,
})
export class Template extends Model<TemplateAttributes, TemplateCreationAttributes> {
  @ForeignKey(() => University)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  universityId!: number;

  @BelongsTo(() => University)
  university!: University;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  templateName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  filePath!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Template;
