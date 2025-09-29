import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Produto from './Produto';

@Table({
    tableName: 'categorias',
    timestamps: false
})
export default class Categoria extends Model {
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

    @HasMany(() => Produto, 'categoria_pk')
    produtos!: Produto[];
}
