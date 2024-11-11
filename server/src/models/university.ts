// src/models/university.ts
import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface UniversityAttributes {
    id: number;
    name: string;
    domain: string;
    accreditationDetails: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UniversityCreationAttributes extends Optional<UniversityAttributes, 'id'> {}

class University extends Model<UniversityAttributes, UniversityCreationAttributes> implements UniversityAttributes {
    public id!: number;
    public name!: string;
    public domain!: string;
    public accreditationDetails!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static initModel(sequelize: Sequelize): typeof University {
        University.init(
            {
                id: {
                    type: DataTypes.INTEGER, // Removed UNSIGNED for PostgreSQL compatibility
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    unique: true,
                },
                domain: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    unique: true,
                },
                accreditationDetails: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE,
            },
            {
                tableName: 'Universities',
                sequelize,
                timestamps: true,
            }
        );

        return University;
    }
}

export default University;
