import { Table, Column, Model, ForeignKey, DataType, AllowNull, BelongsTo } from 'sequelize-typescript';
import Produto from './Produto';

@Table({
    tableName: 'ofertas',
    timestamps: false
})
export default class Ofertas extends Model{

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    tipo!: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false
    })
    preco!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    data_fim!: Date;

    @ForeignKey(() => Produto)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    produto_pk!: number;

    @BelongsTo(() => Produto)
    produto!: Produto;
}