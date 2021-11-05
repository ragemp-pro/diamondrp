

import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
import { helpType, QuestionMessage } from '../../../util/helpmenu';




export class ticketEntity extends Model<ticketEntity> {
    @Column({ primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER(11) })
    id: number;
    /** Тип лога */
    @Column({
        type: Sequelize.STRING(30),
        allowNull: false,
    })
    type: helpType;
    /** Время создания */
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
    })
    timestamp: number;
    /** Время создания */
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
    })
    last_update: number;
    /** ID того, на кого подали жалобу (если это жалоба) */
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
        defaultValue: 0
    })
    report_target?: number;
    /** ID Автора */
    @Column({
        type: Sequelize.INTEGER(11),
        allowNull: false,
    })
    authorid: number;
    /** Имя автора */
    @Column({
        type: Sequelize.STRING(120),
        allowNull: false,
    })
    authorname: string;
    /** Сообщения */
    @Column({
        type: Sequelize.TEXT(),
        allowNull: false,
        get(this): ticketEntity[] {
            return JSON.parse(this.getDataValue("messages"))
        },
        set(this, value: ticketEntity[]) {
            this.setDataValue("messages", JSON.stringify(value))
        }
    })
    messages: QuestionMessage[];
    /** Открыт/Закрыт */
    @Column({
        type: Sequelize.INTEGER(2),
        defaultValue: 0,
        allowNull: false,
        get(this): boolean {
            return this.getDataValue("closed") == 1
        },
        set(this, value: boolean) {
            this.setDataValue("closed", value ? 1 : 0)
        }
    })
    closed:boolean;
}



