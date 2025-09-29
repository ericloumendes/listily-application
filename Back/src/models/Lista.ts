import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import Usuario from './Usuario';
import Produto from './Produto';
import ListaProduto from './ListaProduto';

@Table({
    tableName: 'listas',
    timestamps: false
})
export default class Lista extends Model {

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

    @ForeignKey(() => Usuario)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    usuario_pk!: number;

    @BelongsTo(() => Usuario)
    usuario!: Usuario;

    @BelongsToMany(() => Produto, () => ListaProduto, 'lista_pk', 'produto_pk')
    produtos!: Produto[];
}
