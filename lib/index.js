"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = serialize;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _formalistDataObjectRenderer = require("formalist-data-object-renderer");

var _formalistDataObjectRenderer2 = _interopRequireDefault(_formalistDataObjectRenderer);

var _immutable = require("immutable");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Simple check to see if a variable is an object
 * @param  {Mixed} obj The variable to check
 * @return {Boolean}
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * serializeName
 * Join our path and return a string
 * @param  {Array} path : [["foo"], ["bar"], ["baz"]]
 * @return {String} name : "foo[bar][baz]"
 */

function serializeName(path) {
  return path.map(function (s, i) {
    return i === 0 ? s : "[" + s + "]";
  }).join("");
}

function render(name, value) {
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (value && value.toJS) {
    value = value.toJS();
  }
  if (Array.isArray(value)) {
    return renderList(name, value, path);
  } else if (isObject(value)) {
    return renderMap(name, value, path);
  }
  return renderValue(name, value, path);
}

function renderValue(name, value, path) {
  var append = Array.isArray(name) ? name : [name];
  path = path.concat(append);
  name = serializeName(path);
  value = value != null ? value : "";
  var key = [name, value];
  return _react2.default.createElement("input", {
    key: key,
    name: name,
    value: value,
    type: "hidden"
  });
}

function renderList(name, value, path) {
  if (value.length > 0) {
    return value.map(function (c) {
      // Insert a junk value as the _first_ item in an array where the contents of
      // the array are a map to ensure params are parsed correctly by rack
      // https://github.com/rack/rack/issues/951
      if (isObject(c) || _immutable.Map.isMap(c)) {
        return [render([name, "", "__rack_workaround"], "", path), render([name, ""], c, path)];
      } else {
        return render([name, ""], c, path);
      }
    });
  } else {
    return render(name, "", path);
  }
}

function renderMap(name, value, path) {
  var append = Array.isArray(name) ? name : [name];
  path = path.concat(append);
  return Object.keys(value).map(function (key, index) {
    return render(key, value[key], path);
  });
}

/**
 * Map input/wrappers to the various formalist-schema
 * @param  {Array} Formalist-compatible AST
 * @param  {Object} options Options hash: { prefix: String, additionalFieldTypes: [] }
 * @return {Array} An array of React elements
 */

function serialize(ast) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var prefix = options.prefix;

  var path = prefix ? [prefix] : [];
  var dataObjectRenderer = (0, _formalistDataObjectRenderer2.default)();
  var dataObject = dataObjectRenderer(ast);
  return Object.keys(dataObject).map(function (key, index) {
    return render(key, dataObject[key], path);
  });
}