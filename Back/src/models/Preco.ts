import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Produto from './Produto';

@Table({
    tableName: 'precos',
    timestamps: false
})
export default class Preco extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    pk!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false
    })
    preco!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    data_registro!: Date;

    @ForeignKey(() => Produto)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    produto_pk!: number;

    @BelongsTo(() => Produto)
    produto!: Produto;
}
