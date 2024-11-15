// src/models/University.ts

import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  DefaultScope,
} from 'sequelize-typescript';
import { User } from './User';

export interface UniversityAttributes {
  id: number;
  name: string;
  domain: string;
  accreditationDetails?: string;
  isVerified: boolean;
  verificationDocument?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UniversityCreationAttributes
  extends Omit<UniversityAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@DefaultScope(() => ({
  attributes: { exclude: ['verificationDocument'] },
}))

@Table({
  tableName: 'universities',
  timestamps: true,
})
export class University extends Model<
  UniversityAttributes,
  UniversityCreationAttributes
> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  domain!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  accreditationDetails?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isVerified!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  verificationDocument?: string;

  @HasMany(() => User)
  users!: User[];
}

export default University;
