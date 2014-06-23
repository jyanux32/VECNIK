
//========================================
// CartoDB data provider
//========================================

var VECNIK = VECNIK || {};

(function(VECNIK) {

  VECNIK.CartoDB = VECNIK.CartoDB || {};

  VECNIK.CartoDB.API = function(options) {
    VECNIK.Events.prototype.constructor.call(this);

    this._options = options;
    // TODO: maybe define the reader in options
    this._projection = new VECNIK.MercatorProjection();
    this._reader = new VECNIK.GeoJsonReader({ projection: this._projection });
    this._baseUrl = 'http://'+ options.user +'.cartodb.com/api/v2/sql';

    if (this._options.ENABLE_SIMPLIFY === undefined) {
      this._options.ENABLE_SIMPLIFY = true;
    }
    if (this._options.ENABLE_SNAPPING === undefined) {
      this._options.ENABLE_SNAPPING = true;
    }
    if (this._options.ENABLE_CLIPPING === undefined) {
      this._options.ENABLE_CLIPPING = true;
    }
    if (this._options.ENABLE_FIXING === undefined) {
      this._options.ENABLE_FIXING = true;
    }
  };

  var proto = VECNIK.CartoDB.API.prototype = new VECNIK.Events();

  proto._debug = function(msg) {
    if (this._options.debug) {
      console.log(msg);
    }
  };

  proto._getUrl = function(x, y, zoom) {
    var sql = VECNIK.CartoDB.SQL(this._projection, this._options.table, x, y, zoom, this._options);
    this._debug(sql);
    return this._baseUrl +'?q='+ encodeURIComponent(sql) +'&format=geojson&dp=6';
  };

  proto.load = function(coords) {
    VECNIK.load(this._getUrl(coords.x, coords.y, coords.z))
      .on('load', (function(c) {
        return function(data) {
          this._reader.convertAsync(data, c).on('success', this.onLoad);
        };
      }(coords)), this);

    return this;
  };

  proto.onLoad = function() {
    throw new Error('VECNIK.CartoDB.SQL.onLoad() has to be used');
  };

})(VECNIK);
