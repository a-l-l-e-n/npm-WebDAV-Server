import { IUser } from '../IUser'

export class SimpleUser implements IUser
{
    uid : string

    constructor(
        public username : string,
        public password : string,
        public isAdministrator : boolean,
        public isDefaultUser : boolean,
        public passwordIsValid ?: boolean
    )
    {
        this.uid = username;
    }
}
