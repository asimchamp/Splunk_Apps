import splunk
import splunk.rest as rest
import splunk.entity as en
import splunk.admin as admin
from . import utils
import copy
logger = utils.logger

def makeConfItem(name, entity, confInfo):
    confItem = confInfo[name]
    for key, val in list(entity.items()):
        # may be a bug in admin
        if val is None:
            val = ''
        if key not in ["eai:attributes"]:
            confItem[key] = str(val)

    confItem.copyMetadata(entity[admin.EAI_ENTRY_ACL])

    return confItem


class BaseRestHandler(admin.MConfigHandler):

    def __init__(self, *args, **kwargs):
        admin.MConfigHandler.__init__(self, *args, **kwargs)
        if not hasattr(self, "endpoint"):
            raise Exception("'endpoint' is a mandatory field of the model.")

        self.required_args = getattr(self, "required_args", [])
        self.optional_args = getattr(self, "optional_args", [])
        self.transient_args = getattr(self, "transient_args", [])
        self.allow_extra = getattr(self, "allow_extra", False)

    def get_method(self, name):
        return getattr(self, name, None)

    def setup(self):
        if 0 != len(self.customAction):
            if self.customAction in ['acl']: return
        elif self.requestedAction in [admin.ACTION_CREATE, admin.ACTION_EDIT]:
            arguments = self.required_args + self.optional_args + self.transient_args
            if self.requestedAction in [admin.ACTION_CREATE]:
                for arg in self.required_args:
                    self.supportedArgs.addReqArg(arg)

                for arg in self.optional_args + self.transient_args:
                    self.supportedArgs.addOptArg(arg)

            elif self.requestedAction in [admin.ACTION_EDIT]:
                for arg in arguments:
                    self.supportedArgs.addOptArg(arg)

            if self.allow_extra:
                for arg in list(self.callerArgs.data.keys()):
                    if arg not in arguments:
                        self.supportedArgs.addOptArg(arg)

    def getSortDir(self):
        if self.sortAscending.startswith('true'):
            return 'asc'
        else:
            return 'desc'

    def handleList(self, confInfo):
        if self.callerArgs.id is None:
            ents = self.all()

            for name, ent in list(ents.items()):
                makeConfItem(name, ent, confInfo)
        else:
            try:
                ent = self.get(self.callerArgs.id)
                makeConfItem(self.callerArgs.id, ent, confInfo)
            except splunk.ResourceNotFound:
                pass

    def handleReload(self, confInfo):
        self._reload(confInfo)

    def handleACL(self, confInfo):
        try:
            ent = self.get(self.callerArgs.id)
            meta = ent[admin.EAI_ENTRY_ACL]

            if self.requestedAction in [admin.ACTION_CREATE, admin.ACTION_EDIT] and len(self.callerArgs.data)>0:
                ent.properties = dict()

                ent['sharing'] = meta['sharing']
                ent['owner'] = meta['owner']

                ent['perms.read'] = [None]
                ent['perms.write'] = [None]

                for k, v in list(self.callerArgs.data.items()):
                    ent[k] = v

                en.setEntity(ent, self.getSessionKey(), uri=ent.id+'/acl')
                ent = self.get(self.callerArgs.id)

            confItem = confInfo[self.callerArgs.id]
            acl = copy.deepcopy(meta)
            confItem.actions = self.requestedAction
            confItem.setMetadata(admin.EAI_ENTRY_ACL, acl)

        except splunk.ResourceNotFound as ex:
            logger.exception('handleACL Failed - exception = %s' % ex)

    def handleCreate(self, confInfo):
        try:
            args = self.encode(self.callerArgs.data)
            self.create(self.callerArgs.id, **args)
            self.handleList(confInfo)
        except BaseException as ex:
            logger.exception('handleCreate Failed - exception = %s' % ex)
            raise admin.AlreadyExistsException('An object with name \'%s\' already exists' % (self.callerArgs.id))

    def handleRemove(self, confInfo):
        try:
            self.delete(self.callerArgs.id)
        except splunk.ResourceNotFound as ex:
            logger.exception('handleRemove Failed - exception = %s' % ex)
            raise admin.NotFoundException('Could not find object id \'%s\'' % (self.callerArgs.id)) 
        except BaseException as ex:
            logger.exception('handleRemove Failed - exception = %s' % ex)
            raise admin.InternalException('Failed to delete model id \'%s\'' % (self.callerArgs.id))

    def handleEdit(self, confInfo):
        try:
            args = self.encode(self.callerArgs.data)
            self.update(self.callerArgs.id, **args)
            self.handleList(confInfo)
        except splunk.ResourceNotFound as ex:
            logger.exception('handleEdit Failed - exception = %s' % ex)
            raise admin.NotFoundException('Could not find object id \'%s\'' % (self.callerArgs.id))            
        except BaseException as ex:
            logger.exception('handleEdit Failed - exception = %s' % ex)
            raise admin.InternalException('Failed to edit model id \'%s\'' % (self.callerArgs.id))

    # override when need it.
    def encode(self, args):
        return args

    def _reload(self, confInfo):
        path = "%s/_reload" % self.endpoint
        response, content = rest.simpleRequest(path, sessionKey=self.getSessionKey(),method='POST')
        if response.status != 200:
            raise Exception("_reload fails.")

    def handleDisableAction(self, confInfo, disabled):
        self.update(self.callerArgs.id, disabled=disabled)

    def handleCustom(self, confInfo):
        logger.critical("handle custom [%s]" % self.callerArgs.id)
        logger.critical("handle custom [%s]" % self.customAction)


        if self.customAction in ['acl']:
            return self.handleACL(confInfo)

        if self.customAction == 'disable':
            self.handleDisableAction(confInfo, '1')
        elif self.customAction == 'enable':
            self.handleDisableAction(confInfo, '0')
        elif self.customAction == "_reload":
            self._reload(confInfo)
        else:
            meth = self.get_method(self.customAction)
            if meth:
                ctx = self.getContext()
                meth(ctx)
                makeConfItem(self.callerArgs.id, ctx.entity, confInfo)
            else:
                raise splunk.ResourceNotFound()

    def getContext(self):
        ctx = type('Context', (dict, object), {}) ()
        ctx.entity = self.get()
        ctx.data = self.callerArgs.data

        return ctx

    def user_app(self):
        app  = self.context != admin.CONTEXT_NONE           and self.appName or "-"
        user = self.context == admin.CONTEXT_APP_AND_USER   and self.userName or "nobody"

        return user, app

    def all(self):
        user, app = self.user_app()
        return en.getEntities(self.endpoint,
                              namespace=app,
                              owner=user,
                              sessionKey=self.getSessionKey(),
                              count=self.maxCount+self.posOffset,
                              sort_key=self.sortByKey,
                              sort_dir=self.getSortDir(),
                              offset=self.posOffset)

    def get(self, name):
        user, app = self.user_app()
        return en.getEntity(self.endpoint,
                        name,
                        namespace=app,
                        owner=user,
                        sessionKey=self.getSessionKey())

    def create(self, name, **params):
        user, app = self.user_app()
        new = en.Entity(self.endpoint,
                        "_new",
                        namespace=app,
                        owner=user)

        new["name"] = name

        for arg, val in list(params.items()):
            if arg not in self.transient_args:
                new[arg] = val

        en.setEntity(new, sessionKey=self.getSessionKey())

    def delete(self, name):
        user, app = self.user_app()
        en.deleteEntity(self.endpoint,
                        name,
                        namespace=app,
                        owner=user,
                        sessionKey=self.getSessionKey())


    def update(self, name, **params):
        user, app = self.user_app()
        try:
            ent = en.getEntity(self.endpoint,
                               name,
                               namespace=app,
                               owner=user,
                               sessionKey=self.getSessionKey())

            for arg, val in list(params.items()):
                if arg not in self.transient_args:
                    ent[arg] = val

            en.setEntity(ent, sessionKey=self.getSessionKey())
        except Exception as ex:
            raise ex

def ResourceHandler(model, handler=BaseRestHandler):
    return type(model.__class__.__name__, (handler, model), {})

