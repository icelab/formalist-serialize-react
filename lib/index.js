'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = serialize;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

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
 * passThrough
 *
 * A stateless React wrapper for components that simply returns
 * its children.
 *
 * @param  {Object} props Props matching a node in a formalist AST
 * @return {Array} Array-ish of children
 */

function passThrough(props) {
  return props.children;
}

/**
 * assemblePath
 *
 * A helper function to assemble the current path from `props`
 *
 * @param  {Object} props
 * @return {Array} [path]
 */

function assemblePath() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var serializedPath = props.serializedPath;
  var serializedIndex = props.serializedIndex;
  var name = props.name;

  var path = serializedPath ? serializedPath : [];
  path = path.slice(0);

  if (serializedIndex != null) {
    path.push(serializedIndex);
  }

  if (name != null) {
    path.push(name);
  }

  return path;
}

/**
 * serializeName
 * Join our path and return a string
 * @param  {Array} path : [["foo"], ["bar"], ["baz"]]
 * @return {String} name : "foo[bar][baz]"
 */

function serializeName(path) {
  return path.map(function (s, i) {
    return i === 0 ? s : '[' + s + ']';
  }).join('');
}

/**
 * Attr
 *
 * A stateless React wrapper for components that simply returns
 * its children.
 *
 * @param  {Object} props Props matching a node in a formalist AST
 * @return {Array} Array-ish of children
 */

function attr(props) {
  var path = assemblePath(props);
  return _react2.default.createElement('div', null, _react2.default.Children.map(props.children, function (child) {
    return _react2.default.cloneElement(child, {
      serializedPath: path
    });
  }));
}

attr.propTypes = {
  name: _react2.default.PropTypes.string.isRequired,
  serializedPath: _react2.default.PropTypes.array,
  children: _reactImmutableProptypes2.default.list.isRequired
};

/**
 * Many
 *
 * A stateless React wrapper for components that simply returns
 * its children.
 *
 * @param  {Object} props Props matching a node in a formalist AST
 * @return {Array} Array-ish of children
 */

function many(props) {
  var path = assemblePath(props);
  var children = props.children;

  return _react2.default.createElement('div', null, _immutable.List.isList(children) && children.count() > 0 ? children.map(function renderSet(children) {
    if (_immutable.List.isList(children)) {
      return children.map(function renderChild(child) {
        return _react2.default.cloneElement(child, {
          serializedPath: path,
          serializedIndex: ''
        });
      });
    } else {
      return _react2.default.cloneElement(children, {
        serializedPath: path,
        serializedIndex: ''
      });
    }
  }) : _react2.default.createElement(input, {
    value: '',
    serializedPath: path
  }));
}

many.propTypes = {
  name: _react2.default.PropTypes.string.isRequired,
  serializedPath: _react2.default.PropTypes.array,
  children: _reactImmutableProptypes2.default.list.isRequired
};

/**
 * List
 *
 * @return {ReactComponent}
 */

function list(props) {
  var path = assemblePath(props);
  var value = props.value;

  var listValue = value;

  return _react2.default.createElement('div', null, _immutable.List.isList(listValue) && listValue.count() > 0 ? listValue.map(function renderValue(value, index) {
    if (_immutable.Map.isMap(value)) {
      return mapInput({
        key: path + '-' + index,
        value: value,
        serializedPath: path,
        serializedIndex: ''
      });
    } else {
      return _react2.default.createElement(input, {
        key: path + '-' + index,
        value: value,
        serializedPath: path,
        serializedIndex: ''
      });
    }
  }) : _react2.default.createElement(input, {
    value: '',
    serializedPath: path
  }));
}

list.propTypes = {
  name: _react2.default.PropTypes.string.isRequired,
  value: _react2.default.PropTypes.any,
  serializedPath: _react2.default.PropTypes.array
};

/**
 * Input
 *
 * Stateless React component that creates a hidden input for a given
 * field and outputs its value.
 *
 * @return {ReactComponent}
 */

function input(props) {
  var path = assemblePath(props);
  var value = props.value;

  var serializedName = serializeName(path);
  return _react2.default.createElement('input', {
    'type': 'hidden',
    'name': serializedName,
    'value': value
  });
}

input.propTypes = {
  value: _react2.default.PropTypes.any,
  serializedPath: _react2.default.PropTypes.array,
  serializedIndex: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.number, _react2.default.PropTypes.string])
};

/**
 * Turn an Immutable Map of key/values into a set of nested inputs
 * @param  {Object} props
 * @return {Mixed} A React-renderable set of children
 */
function mapInput(props) {
  var path = assemblePath(props);
  // Ensure value is an `ImmutableMap`
  var value = props.value;

  // Iterate over the keys in the Map

  if (value) {
    return value.keySeq().map(function renderObjectKeys(key, index) {
      var nestedValue = value.get(key);
      // Push the key into the path
      var nestedPath = path.slice();
      nestedPath = nestedPath.concat([key]);

      if (isObject(nestedValue)) {
        return mapInput({
          key: nestedPath + '-' + index,
          value: (0, _immutable.Map)(nestedValue),
          serializedPath: nestedPath
        });
      } else if (Array.isArray(nestedValue)) {
        return list({
          key: nestedPath + '-' + index,
          value: (0, _immutable.List)(nestedValue),
          serializedPath: nestedPath
        });
      } else {
        return _react2.default.createElement(input, {
          key: nestedPath + '-' + index,
          value: nestedValue,
          serializedPath: nestedPath
        });
      }
    });
  } else {
    return null;
  }
}

mapInput.propTypes = {
  value: _reactImmutableProptypes2.default.map,
  serializedPath: _react2.default.PropTypes.array
};

/**
 * Wrap a passed `component` by returning a function that will call it with
 * new `additionalProps` mixed in
 * @param  {ReactComponent} component
 * @param  {Object} additionalProps
 * @return {Function}
 */

function wrapComponent(component, additionalProps) {
  return function (componentProps) {
    var props = Object.assign({}, componentProps, additionalProps);
    return _react2.default.createElement(component, props);
  };
}

/**
 * Map input/wrappers to the various formalist-schema
 * @param  {Object} options Options hash: { prefix: String, additionalFieldTypes: [] }
 * @return {Object} A object referencing the various React components above
 */

function serialize() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var prefix = options.prefix;
  var additionalFieldTypes = options.additionalFieldTypes;

  var additionalProps = {
    serializedPath: prefix ? [prefix] : []
  };
  var definition = {
    fields: {
      checkBox: wrapComponent(input, additionalProps),
      dateField: wrapComponent(input, additionalProps),
      dateTimeField: wrapComponent(input, additionalProps),
      hiddenField: wrapComponent(input, additionalProps),
      multiSelectionField: wrapComponent(list, additionalProps),
      multiUploadField: wrapComponent(list, additionalProps),
      numberField: wrapComponent(input, additionalProps),
      radioButtons: wrapComponent(input, additionalProps),
      selectBox: wrapComponent(input, additionalProps),
      selectionField: wrapComponent(input, additionalProps),
      textArea: wrapComponent(input, additionalProps),
      textField: wrapComponent(input, additionalProps),
      uploadField: wrapComponent(mapInput, additionalProps)
    },
    attr: wrapComponent(attr, additionalProps),
    many: wrapComponent(many, additionalProps),
    compoundField: passThrough,
    group: passThrough,
    section: passThrough
  };

  // Allow for serialization of any custom field types
  if (additionalFieldTypes) {
    additionalFieldTypes.forEach(function (type) {
      definition.fields[type] = wrapComponent(input, additionalProps);
    });
  }

  return definition;
}