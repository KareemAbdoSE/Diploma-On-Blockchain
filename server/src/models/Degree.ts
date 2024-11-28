import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DefaultScope,
} from 'sequelize-typescript';
import { User } from './User';
import University from './University';

export interface DegreeAttributes {
  id: number;
  userId?: number | null; // Nullable until linked
  universityId: number;
  degreeType: string;
  major: string;
  graduationDate: Date;
  studentEmail: string;
  status: string; // 'draft', 'submitted', 'linked'
  filePath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DegreeCreationAttributes
  extends Omit<DegreeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@DefaultScope(() => ({
  attributes: { exclude: ['filePath'] }, // Exclude filePath by default
}))
@Table({
  tableName: 'degrees',
  timestamps: true,
})
export class Degree extends Model<DegreeAttributes, DegreeCreationAttributes> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null,
  })
  userId!: number | null;

  @BelongsTo(() => User)
  user!: User;

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
  degreeType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  major!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  graduationDate!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  studentEmail!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'draft',
  })
  status!: string; // 'draft', 'submitted', 'linked'

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  filePath?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Degree;
