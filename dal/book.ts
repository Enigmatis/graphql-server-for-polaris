import {Column, Entity} from "typeorm";
import {CommonModel} from '@enigmatis/polaris-typeorm';

@Entity()
export class Book extends CommonModel {

    constructor(title?: string, author?: string, dataVersion?: number) {
        super();
        title ? this.title = title : {};
        author ? this.author = author : {};
        dataVersion ? this.dataVersion = dataVersion : {};
    }

    @Column()
    title: string;

    @Column()
    author: string;
}