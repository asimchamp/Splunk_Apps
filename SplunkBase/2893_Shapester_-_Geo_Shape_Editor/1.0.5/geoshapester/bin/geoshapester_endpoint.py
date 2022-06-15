import os
import json
import re
import splunk.rest
import zipfile
import lxml.etree as et


def lookup_folder():
    return os.path.normpath(os.path.join(__file__, '..', '..', 'lookups'))


KML_TMPL = '''<?xml version="1.0" encoding="utf-8" ?>
<kml xmlns="http://www.opengis.net/kml/2.2">
    <Document id="root_doc">
        <Schema name="%(name)s" id="%(name)s">
            <SimpleField name="Name" type="string"></SimpleField>
        </Schema>
        <Folder>
            <name>%(name)s</name>
        </Folder>
    </Document>
</kml>
'''

PLACEMARK_TMPL = '''\
<Placemark xmlns="http://www.opengis.net/kml/2.2">
    <name>%(name)s</name>
    <Style><LineStyle><color>ff0000ff</color></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>
    <Polygon><outerBoundaryIs><LinearRing><coordinates>%(coords)s</coordinates></LinearRing></outerBoundaryIs></Polygon>
</Placemark>
'''


def create_kml_placemark(name, coords):
    fragment = et.fromstring(PLACEMARK_TMPL)
    fragment.find(to_ns_xpath('name')).text = name
    fragment.find(to_ns_xpath('Polygon', 'outerBoundaryIs', 'LinearRing', 'coordinates')).text = coords
    return fragment


def create_kml(name, placemarks):
    doc = et.fromstring(KML_TMPL)
    schema = doc.find(to_ns_xpath('Document', 'Schema'))
    schema.attrib['name'] = name
    schema.attrib['id'] = name
    doc.find(to_ns_xpath('Document', 'Folder', 'name')).text = name
    folder = doc.find(to_ns_xpath('Document', 'Folder'))
    for placemark in placemarks:
        folder.append(placemark)
    return doc


def kml_placemark_from_feature(feature):
    name = feature.get('id')
    coords = []
    for lat, lng in feature.get('geometry').get('coordinates')[0]:
        coords.append("%s,%s" % (lat, lng))
    coords = " ".join(coords)
    return create_kml_placemark(name, coords)


def geo_json_to_kml(geoJSON, name):
    placemarks = map(kml_placemark_from_feature, geoJSON.get('features'))
    return et.tostring(create_kml(name, placemarks))


def write_lookup(name, geoJSON):
    kml = geo_json_to_kml(geoJSON, name)
    folder = lookup_folder()
    if not os.path.exists(folder):
        os.mkdir(folder)
    kmz_name = 'geo_%s.kmz' % name
    zipfile_path = os.path.join(folder, kmz_name)
    kml_filename = '%s.kml' % name
    with zipfile.ZipFile(zipfile_path, 'w') as zfp:
        zfp.writestr(kml_filename, kml)
    return kmz_name


def to_ns_xpath(*args):
    return "/".join(['.'] + ['{http://www.opengis.net/kml/2.2}%s' % el for el in args])


def coords_kml_to_geojson(coordsstr):
    return [[map(float, a.split(',')) for a in coordsstr.split(' ')]]


def placemark_kml_to_json(placemark):
    try:
        name = placemark.find(to_ns_xpath('name')).text
        return {
            "type": "Feature",
            "properties": {
                "name": name
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": coords_kml_to_geojson(
                    placemark.find(to_ns_xpath('Polygon', 'outerBoundaryIs', 'LinearRing', 'coordinates')).text)
            },
            "id": name
        }
    except:
        pass


def kml_to_geo_json(kml):
    folder_node = kml.find(to_ns_xpath('Document', 'Folder'))
    features = folder_node.findall(to_ns_xpath('Placemark'))
    return {
        "type": "FeatureCollection",
        "features": [placemark_kml_to_json(feature) for feature in features if feature is not None]
    }


def lookup_files_to_geo_json(folder):
    result = []
    for f in os.listdir(folder):
        if f.endswith('.kmz'):
            try:
                zip = zipfile.ZipFile(os.path.join(folder, f), 'r')
                match = re.match(r'geo_(.+?)\.kmz', f)
                if match:
                    name = match.group(1)
                    kmlfile = [f for f in zip.namelist() if f.endswith('.kml')][0]
                    fp = zip.open(kmlfile, 'r')
                    kml = et.fromstring(fp.read())
                    fp.close()
                    json = kml_to_geo_json(kml)
                    if json is not None:
                        result.append(dict(name=name, geoJSON=json))
            except:
                pass
    return result


def create_transforms_stanza(name, filename, sessionKey):
    data = dict(
        name='geo_%s' % name,
        external_type="geo",
        filename=filename
    )
    splunk.rest.simpleRequest(
        path='/servicesNS/nobody/geoshapester/data/transforms/lookups',
        sessionKey=sessionKey,
        postargs=data,
        method="POST")


def reload_lookup_table_files(sessionKey):
    splunk.rest.simpleRequest(
        path='/services/admin/lookup-table-files/_reload',
        sessionKey=sessionKey,
        method="GET")


class ShapeCollectionHandler(splunk.rest.BaseRestHandler):
    def handle_GET(self):
        self.response.setStatus(200)
        self.response.setHeader('content-type', 'application/json')
        self.response.write(json.dumps(lookup_files_to_geo_json(lookup_folder())))

    def handle_POST(self):
        payload = json.loads(self.request.get('payload'))
        filename = write_lookup(payload.get('name'), payload.get('geoJSON'))
        reload_lookup_table_files(self.sessionKey)
        create_transforms_stanza(payload.get('name'), filename, self.sessionKey)
        self.response.setStatus(200)
        self.response.setHeader('content-type', 'application/json')
        self.response.write(json.dumps(dict(success=True, r=filename)))
