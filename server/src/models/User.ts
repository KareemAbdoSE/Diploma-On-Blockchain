import {
  Table,
  Column,
  Model,
  DataType,
  BeforeSave,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import { Role } from './Role';
import { University } from './University';
import CryptoJS from 'crypto-js';

export interface UserCreationAttributes {
  email: string;
  password: string;
  roleId: number;
  isVerified?: boolean;
  universityId?: number;
  walletAddress?: string | null;
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

  @ForeignKey(() => University)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  universityId!: number | null;

  @BelongsTo(() => University)
  university!: University;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isVerified!: boolean;

  // MFA Fields
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  mfaEnabled!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    get() {
      const encrypted = this.getDataValue('mfaSecret');
      if (encrypted) {
        const bytes = CryptoJS.AES.decrypt(encrypted, process.env.MFA_SECRET_KEY!);
        return bytes.toString(CryptoJS.enc.Utf8);
      }
      return null;
    },
    set(value: string | null) {
      if (value) {
        const encrypted = CryptoJS.AES.encrypt(value, process.env.MFA_SECRET_KEY!).toString();
        this.setDataValue('mfaSecret', encrypted);
      } else {
        this.setDataValue('mfaSecret', null);
      }
    },
  })
  mfaSecret!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    get() {
      const encrypted = this.getDataValue('mfaTempSecret');
      if (encrypted) {
        const bytes = CryptoJS.AES.decrypt(encrypted, process.env.MFA_SECRET_KEY!);
        return bytes.toString(CryptoJS.enc.Utf8);
      }
      return null;
    },
    set(value: string | null) {
      if (value) {
        const encrypted = CryptoJS.AES.encrypt(value, process.env.MFA_SECRET_KEY!).toString();
        this.setDataValue('mfaTempSecret', encrypted);
      } else {
        this.setDataValue('mfaTempSecret', null);
      }
    },
  })
  mfaTempSecret!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/, // Ethereum address validation
    },
  })
  walletAddress!: string | null;

  @BeforeSave
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
