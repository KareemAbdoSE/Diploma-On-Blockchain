// src/models/Role.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import University from './University';

@Table({
  tableName: 'roles',
  timestamps: true,          // Adds createdAt and updatedAt timestamps
})
export class Role extends Model<Role> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,            // Ensures role names are unique
  })
  name!: string;
}

export default Role;
