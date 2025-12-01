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

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    Latitude!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    Longitude!: string;

    @Column({
        type: DataType.TIME,
        allowNull: false
    })
    horario_funcionamento_inicio!: string;

    @Column({
        type: DataType.TIME,
        allowNull: false
    })
    horario_funcionamento_fim!: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING(255)),
        allowNull: false
    })
    dias_funcionamento!: string[];
}
