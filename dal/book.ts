// @ts-ignore
import {CommonModel, Column, Entity} from '@enigmatis/polaris-typeorm';

@Entity()
export class Book extends CommonModel {

    constructor(title: string, author: string) {
        super();
        title ? this.title = title : {};
        author ? this.author = author : {};
    }

    @Column()
    title: string;

    @Column()
    author: string;
}