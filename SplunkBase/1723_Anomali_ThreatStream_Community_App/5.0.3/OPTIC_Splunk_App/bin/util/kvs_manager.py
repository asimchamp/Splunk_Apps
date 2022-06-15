import json, time
import settings

class Kvs_manager():
    
    def __init__(self, splunka, logger):
        self.logger = logger
        self.splunka = splunka
        self.kv_stores = {}
        for collection in self.splunka.service.kvstore:
            if collection.name.startswith('ts_') or collection.name.startswith('tm_'):
                self.kv_stores[collection.name] = collection
        self.logger.debug('kvsm> self.kv_stores: %s' % self.kv_stores.keys()) 
    
    def get_kvs(self, collection_name, query_data=None):
        collection = self.get_collection(collection_name)
        if collection:
            return collection.data.query() if not query_data else collection.data.query(query=json.dumps(query_data))
        return None
    
    def get_item(self, collection_name, _key):
        query_data  ={'_key': _key}
        result = self.get_kvs(collection_name, query_data)
        if result and isinstance(result, list):
            return result[0]
        
    def get_kvs_item_by_id(self, collection_name, _key):
        collection = self.get_collection(collection_name)
        if collection:
            try:
                return collection.data.query_by_id(_key)
            except:
                pass
        return None
            
    def add_kvs_batch(self, collection_name, data):
        try:
            self._add_kvs_batch(collection_name, data)
        except:
            self.logger.error('Failed at add_kvs_batch, collection_name: %s, data: %s' % (collection_name, data))
            raise
            
    def _add_kvs_batch(self, collection_name, data):
        sz = len(data)
#         self.logger.debug('kvsm> add_kvs_batch, collection_name: %s, len(data): %s, data: %s' % (collection_name, sz, data))
        collection = self.kv_stores.get(collection_name)
        if not collection:
            self.logger.debug('kvsm> error: collection %s is not in self.kv_stores' % collection_name)
            return

        i0 = 0
        while i0 < sz:
            i1 = min(i0 + settings.DEFAULT_KVS_BATCH_SIZE, sz)
            slice_data = data[i0:i1]
            t0 = time.time()
            results = collection.data.batch_save(*slice_data)
#             self.logger.debug('kvsm> add_kvs_batch, slice_data: %s, len(slice_data): %s, time: %s, slice_data: %s' % (collection_name, len(slice_data), time.time() - t0, slice_data))
            i0 += settings.DEFAULT_KVS_BATCH_SIZE
                    
    def get_collection(self, collection_name):
        collection = self.kv_stores.get(collection_name)
        if not collection:
             self.logger.warn('kvsm> get_collection, collection "%s" is not found.' % collection_name)
        return collection
            
    def get_kvs_item_ids(self, collection_name, query_dict):
        collection = self.get_collection(collection_name)
        ids = []
        if collection:
            try:
                items = collection.data.query(query=json.dumps(query_dict))
                self.logger.debug('kvsm> get_kvs_item_ids, items: %s' % items)
            except Exception as e:
                self.logger.error('%s' % e)
                items = []
            ids = [item.get('_key') for item in items]
        return ids
        
    def update_kvs_by_ids(self, collection_name, id_list, data_list):
        collection = self.kv_stores.get(collection_name)
        sz = min(len(id_list, data_list))
        for i in range(sz):  
            collection.data.update(id_list[i], data_list[i])
            
    def delete_kvs_items_by_query(self, collection_name, query_dict):
        ids = self.get_kvs_item_ids(collection_name, query_dict)
        return self.delete_kvs_items_by_id(collection_name, ids)
    
    def delete_kvs_items_by_id(self, collection_name, ids):
        collection = self.kv_stores.get(collection_name)
        for id in ids:
            collection.data.delete_by_id(id)
        return len(ids)
        
    def delete_kvs(self, collection_name):
        if collection_name == 'all':
            for col in self.kv_stores.values():
                col.data.delete()
            return
        
        collection = self.kv_stores.get(collection_name)
        if collection:
            collection.data.delete()
 