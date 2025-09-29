import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'usuarios',
    timestamps: false
})
export default class Usuario extends Model {

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
        allowNull: false,
        unique: true
    })
    email!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    senha!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    rg!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    data_criacao!: Date;
}
