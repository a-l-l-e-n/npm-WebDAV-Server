import { IUser } from '../IUser'

export interface ITestableUserManager
{
    getDefaultUser(callback : (user : IUser) => void)
    getUserByNamePassword(domain : string, name : string, password : string, callback : (error : Error, user ?: IUser) => void)
}
