An implementation of Mapbox tiles for JMap.

Mapbox files placed in the data directory will be served by JMapBox via this url:

http://127.0.0.1:8500/tileserver?mapid=myshinymap&z={z}&x={x}&y={y}

Required params are mapid, z, x and y.

You can query available mapbox files by using this url:

http://127.0.0.1:8500/catalogue


To install/run:

npm install
node ./bin/runserver
