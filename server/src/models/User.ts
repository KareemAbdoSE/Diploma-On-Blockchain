// src/models/User.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeSave,
} from 'sequelize-typescript';
import { Role } from './Role';
import bcrypt from 'bcrypt';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  roleId!: number;

  @BelongsTo(() => Role)
  role!: Role;

  @BeforeSave
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      const saltRounds = 12;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
  }

  // Method to compare passwords
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
