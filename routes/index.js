/******************************************************************************
 * Feature Server API
 *
 *
 ******************************************************************************/
var express     = require('express');
var router      = express.Router();
var config      = require(__dirname + '/../etc/config.json');
var MBTiles     = require('mbtiles');
var dir         = require('node-dir');
var dataDir     = __dirname + '/../data'
var tileSources = {};

dir.files(dataDir, function(err, files) {
    if (err) throw err;

    for (var i = 0; i < files.length; i++) {
        var mbox = new MBTiles(files[i], function(err, source){
            if(err){
                throw err;
            }

            source.getInfo(function(err, data) {
                if(err) {
                    throw err;
                }

                tileSources[data.id] = source;
            });
        });
    }
});


router.get('/', function(req, res, next) {
    return res.render('index');
});

router.get('/tileserver', function(req, res, next) {
    var mapid = req.query.mapid;

    if(!mapid) {
        return next(new Error("Missing map id."));
    }

    var source = tileSources[mapid];
    if(source === undefined) {
        return next(new Error("Unknown map id."));
    }

    var x = req.query.x;
    var y = req.query.y;
    var z = req.query.z;

    if(x && y && z) {
        source.getTile(z,x,y, function(err, buffer, headers) {
            if(err){
                if(err = 'Error: Tile does not exist') {
                    return res.status(404).send("Tile does not exist");
                }
                else{
                    return next(err);
                }
            }
            //console.log(headers);
            res.set('Content-Type', 'image/png');
            return res.send(buffer);
        });
    }
    else {
        return next(new Error("Missing tile coordinates."));
    }
});

router.get('/gridserver', function(req, res, next) {
    var mapid = req.query.mapid;

    if(!mapid) {
        return next(new Error("Missing map id."));
    }

    var source = tileSources[mapid];
    if(source === undefined) {
        return next(new Error("Unknown map id."));
    }

    var x = req.query.x;
    var y = req.query.y;
    var z = req.query.z;

    if(x && y && z) {
        source.getGrid(z,x,y, function(err, grid, headers) {
            if(err){
                return next(err);
            }
            console.log(headers);
            res.set('Content-Type', 'text/javascript');
            return res.send(grid);
        });
    }
    else {
        return next(new Error("Missing grid coordinates."));
    }
});

router.get('/catalogue', function(req, res, next) {
    var info = [];
    for (var id in tileSources) {
        if(id) {
            tileSources[id].getInfo(function(err, data) {
                if(err){
                    return next(err);
                }
                info.push(data);
            });
        }
    }

    return res.json(info);
});

module.exports = router;
