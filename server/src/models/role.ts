// src/models/role.ts
import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface RoleAttributes {
    id: number;
    name: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    public id!: number;
    public name!: string;

    public static initModel(sequelize: Sequelize): typeof Role {
        Role.init(
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
            },
            {
                tableName: 'Roles',
                sequelize,
                timestamps: false,
            }
        );

        return Role;
    }
}

export default Role;
