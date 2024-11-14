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

export interface UserCreationAttributes {
  email: string;
  password: string;
  roleId: number;
  isVerified?: boolean; // Optional during creation
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User, UserCreationAttributes> {
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

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Users start as unverified
  })
  isVerified!: boolean;

  // Hash password before saving to the database
  @BeforeSave
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 12);
    }
  }

  // Method to compare plain text password with hashed password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export default User;
