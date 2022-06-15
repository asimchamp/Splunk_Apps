
def write_to_csv_nested_objects(writer, items, headers, id_key):
    writer.writeheader()

    count, total = 0, len(items)
    for item in items:
        item["_key"] = item.get(id_key)
        to_write = {}
        count += 1
        for key in headers:
            value = ""
            if "." in key:
                key1, key2 = key.split(".")
                if key1 in item and key2 in item[key1]:
                    if isinstance(item[key1][key2], list):
                        value = ",".join(str(x) for x in item[key1][key2])
                    elif isinstance(item[key1][key2], basestring):
                        value = item[key1][key2].encode("utf-8")
                    else:
                        value = item[key1][key2]
            else:
                if key in item:
                    if isinstance(item[key], list):
                        value = ", ".join(item[key])
                    elif isinstance(item[key], basestring):
                        value = item[key].encode("utf-8")
                    else:
                        value = item[key]
            to_write[key.replace(".","")] = value
        writer.writerow(to_write)