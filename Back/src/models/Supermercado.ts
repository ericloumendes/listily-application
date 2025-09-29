import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'supermercados',
    timestamps: false
})
export default class Supermercado extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    pk!: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    nome!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    endereco!: string;
}
