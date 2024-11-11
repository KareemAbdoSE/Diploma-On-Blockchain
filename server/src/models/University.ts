// src/models/University.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'universities',
  timestamps: true,
})
export class University extends Model<University> {
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
  accreditationDetails!: string;
}
