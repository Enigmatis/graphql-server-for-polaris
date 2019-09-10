import {Column, Entity} from "typeorm";
import {CommonModel} from '@enigmatis/polaris-typeorm';

@Entity()
export class Book extends CommonModel{
    @Column()
    title: string;

    @Column()
    author: string;
}