import * as http from 'http';

export interface customIncomingMessage extends http.IncomingMessage {
    domainName: string;
}