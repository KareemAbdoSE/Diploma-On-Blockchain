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
  timestamps: true,             // Adds createdAt and updatedAt timestamps
})
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,               // Ensures email addresses are unique
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;            // Hashed password

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  roleId!: number;              // Foreign key to Role

  @BelongsTo(() => Role)
  role!: Role;                  // Association with Role

  // Hash password before saving to the database
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
