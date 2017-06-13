import { WebDAVServerOptions, setDefaultServerOptions } from '../WebDAVServerOptions'
import { ResourceTreeNode, WebDAVServerStartCallback } from './Types'
import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ReturnCallback } from '../../resource/IResource'
import { HTTPAuthentication } from '../../user/authentication/HTTPAuthentication'
import { IPrivilegeManager } from '../../user/privilege/IPrivilegeManager'
import { FSManager, FSPath } from '../../manager/FSManager'
import { IUserManager } from '../../user/IUserManager'
import Commands from '../commands/Commands'
import * as https from 'https'
import * as http from 'http'

import * as persistence from './Persistence'
import * as beforeAfter from './BeforeAfter'
import * as startStop from './StartStop'
import * as resource from './Resource'
import * as events from './Events'

export { WebDAVServerOptions } from '../WebDAVServerOptions'


export class WebDAVServer
{
    public httpAuthentication : HTTPAuthentication
    public privilegeManager : IPrivilegeManager
    public rootResource : IResource
    public userManager : IUserManager
    public options : WebDAVServerOptions
    public methods : object

    protected beforeManagers : WebDAVRequest[]
    protected afterManagers : WebDAVRequest[]
    protected unknownMethod : WebDAVRequest
    protected server : http.Server | https.Server

    constructor(options ?: WebDAVServerOptions)
    {
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = {};
        this.options = setDefaultServerOptions(options);

        this.httpAuthentication = this.options.httpAuthentication;
        this.privilegeManager = this.options.privilegeManager;
        this.rootResource = this.options.rootResource;
        this.userManager = this.options.userManager;

        // Implement all methods in commands/Commands.ts
        for(const k in Commands)
            if(k === 'NotImplemented')
                this.onUnknownMethod(Commands[k]);
            else
                this.method(k, Commands[k]);
    }

    getResourceFromPath(path : FSPath | string[] | string, callback : ReturnCallback<IResource>)
    getResourceFromPath(path : FSPath | string[] | string, rootResource : IResource, callback : ReturnCallback<IResource>)
    getResourceFromPath(path : FSPath | string[] | string, callbackOrRootResource : ReturnCallback<IResource> | IResource, callback ?: ReturnCallback<IResource>)
    {
        resource.getResourceFromPath.bind(this)(path, callbackOrRootResource, callback);
    }

    addResourceTree(resoureceTree : ResourceTreeNode, callback : (e : Error) => void)
    addResourceTree(rootResource : IResource, resoureceTree : ResourceTreeNode, callback : (e : Error) => void)
    addResourceTree(_rootResource : IResource | ResourceTreeNode, _resoureceTree : ResourceTreeNode | (() => void), _callback ?: (e : Error) => void)
    {
        resource.addResourceTree.bind(this)(_rootResource, _resoureceTree, _callback);
    }

    onUnknownMethod(unknownMethod : WebDAVRequest)
    {
        this.unknownMethod = unknownMethod;
    }

    // Start / Stop
    start(port : number)
    start(callback : WebDAVServerStartCallback)
    start(port : number, callback : WebDAVServerStartCallback)
    start(port ?: number | WebDAVServerStartCallback, callback ?: WebDAVServerStartCallback)
    {
        startStop.start.bind(this)(port, callback);
    }
    stop = startStop.stop

    // Persistence
    load = persistence.load
    save = persistence.save

    method(name : string, manager : WebDAVRequest)
    {
        this.methods[this.normalizeMethodName(name)] = manager;
    }

    protected normalizeMethodName(method : string) : string
    {
        return method.toLowerCase();
    }

    // Before / After execution
    beforeRequest = beforeAfter.beforeRequest
    afterRequest = beforeAfter.afterRequest

    protected invokeBARequest = beforeAfter.invokeBARequest
    protected invokeBeforeRequest = beforeAfter.invokeBeforeRequest
    protected invokeAfterRequest = beforeAfter.invokeAfterRequest

    // Events
    invoke(event : events.EventsName, arg : MethodCallArgs, subjectResource ?: IResource | FSPath, details ?: events.DetailsType)
    {
        events.invoke.bind(this)(event, subjectResource, details);
    }

    on(event : events.EventsName, listener : events.Listener)
    on(event : events.EventsName, eventName : string, listener : events.Listener)
    on(event : events.EventsName, eName_listener : string | (events.Listener), listener ?: events.Listener)
    {
        if(eName_listener.constructor === Function)
            events.register.bind(this)(event, eName_listener);
        else
            events.registerWithName.bind(this)(event, eName_listener, listener);
    }
    clearEvent(event : events.EventsName)
    {
        events.clear.bind(this)(event);
    }
    clearEvents(event : events.EventsName)
    {
        events.clearAll.bind(this)();
    }
    removeEvent(event : events.EventsName, listener : events.Listener)
    removeEvent(event : events.EventsName, eventName : string)
    removeEvent(event : events.EventsName, eName_listener : string | (events.Listener))
    {
        if(eName_listener.constructor === Function)
            events.remove.bind(this)(event, eName_listener);
        else
            events.removeByName.bind(this)(event, eName_listener);
    }
}
