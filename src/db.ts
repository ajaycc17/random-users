import Dexie, { Table } from "dexie";

export interface User {
    id?: string;
    name?: string;
    image?: string;
}

export class UserData extends Dexie {
    users!: Table<User>;

    constructor() {
        super("UserData");
        this.version(1).stores({
            users: "id, name, image",
        });
    }
}

export const db = new UserData();
