# Shapester - Shape editor for geospatial lookups

Splunk introduced Geospatial Lookups as a new lookup type with version 6.3. These lookups allow Splunk to find the shape that contains a latitude/longitude coordinate. 

This app lets you draw your own shapes and polygons directly on the map and save them as a geospatial lookup. You can then use this lookup to set up alerts based on geofences. Or you can create a building map by drawing the buildings of your campus.

## Usage:
1. Create shapes in the shape editor and name them. This name will be used for the feature ID.
2. Click _Save_ and enter a lookup name. The lookup should contain no spaces (E.g. `my_shapes`)
3. Optionally: Set permissions for the lookup so they can be used by other apps. Go to _Manage Lookups_, set the permission for your lookup (note it will start with `geo_`) and set visibility to _All apps_.
4. Use the lookup. Again, the name starts with `geo_` (E.g. `geo_my_shapes`)

```
sourcetype=earthquakes 
| lookup geo_my_shapes latitude longitude OUTPUT featureId 
| stats max(mag) by featureId 
| geom geo_my_shapes featureIdField=featureId
```