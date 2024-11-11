// src/models/user.ts
import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface UserAttributes {
    id: number;
    email: string;
    password: string;
    roleId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public roleId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static initModel(sequelize: Sequelize): typeof User {
        User.init(
            {
                id: {
                    type: DataTypes.INTEGER, // Removed UNSIGNED for PostgreSQL compatibility
                    autoIncrement: true,
                    primaryKey: true,
                },
                email: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    unique: true,
                    validate: {
                        isEmail: true,
                    },
                },
                password: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                },
                roleId: {
                    type: DataTypes.INTEGER, // Removed UNSIGNED for PostgreSQL compatibility
                    allowNull: false,
                    references: {
                        model: 'Roles',
                        key: 'id',
                    },
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE,
            },
            {
                tableName: 'Users',
                sequelize,
                timestamps: true,
            }
        );

        return User;
    }
}

export { User };
