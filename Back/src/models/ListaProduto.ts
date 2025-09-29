// ListaProduto.ts
import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import Produto from './Produto';
import Lista from './Lista';

@Table({
    tableName: 'lista_produto',
    timestamps: false
})
export default class ListaProduto extends Model {
    @ForeignKey(() => Lista)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    lista_pk!: number;

    @ForeignKey(() => Produto)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    produto_pk!: number;
}
