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
    unique: true,                // Ensures university names are unique
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,                // Ensures domains are unique
  })
  domain!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  accreditationDetails!: string; // Optional accreditation details
}
