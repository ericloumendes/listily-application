import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import Lista from './Lista';
import ListaProduto from './ListaProduto';
import Supermercado from './Supermercado';
import Preco from './Preco';
import Categoria from './Categoria';
import Ofertas from './Ofertas';

@Table({
    tableName: 'produtos',
    timestamps: false
})
export default class Produto extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    pk!: number;

    @Column({ type: DataType.STRING(255), allowNull: false })
    nome!: string;

    @Column({ type: DataType.STRING(255), allowNull: false })
    descricao!: string;

    @Column({ type: DataType.STRING(255), allowNull: true, unique: false })
    codigo_barras!: string;

    @Column({ type: DataType.DATE, allowNull: false })
    data_cadastro!: Date;

    @ForeignKey(() => Supermercado)
    @Column({ type: DataType.INTEGER, allowNull: false })
    supermercado_pk!: number;

    @BelongsTo(() => Supermercado)
    supermercado!: Supermercado;

    @ForeignKey(() => Categoria)
    @Column({ type: DataType.INTEGER, allowNull: false })
    categoria_pk!: number;

    @BelongsTo(() => Categoria)
    categoria!: Categoria;

    @Column({
        type: DataType.BLOB('long'),
        allowNull: true
    })
    imagem!: Buffer | null; // Image field

    @BelongsToMany(() => Lista, () => ListaProduto, 'produto_pk', 'lista_pk')
    listas!: Lista[];

    @HasMany(() => Preco, 'produto_pk')
    precos!: Preco[];

    @HasMany(() => Ofertas, 'produto_pk')
    ofertas!: Ofertas[];

    // Static method to search by codigo_barras
    static async findByCodigoBarras(codigo_barras: string) {
        return await this.findAll({ where: { codigo_barras } });
    }
}
