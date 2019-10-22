import { HTTPRequestContext } from '../../../server/v2/RequestContext';
import { IUser } from '../IUser';
export interface HTTPAuthentication {
    askForAuthentication(domain : string): {
        [headeName: string]: string;
    };
    getUser(ctx: HTTPRequestContext, callback: (error: Error, user?: IUser) => void): void;
}
