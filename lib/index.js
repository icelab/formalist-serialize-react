'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = serialize;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  path.push(name);
  return path;
}

// Join our path into an HTML array foo[bar][baz]
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

  return _react2.default.createElement('div', null, children.map(function renderSet(children, setIndex) {
    if (_immutable2.default.List.isList(children)) {
      return children.map(function renderChild(child, index) {
        return _react2.default.cloneElement(child, {
          serializedPath: path,
          serializedIndex: index
        });
      });
    } else {
      return _react2.default.cloneElement(children, {
        serializedPath: path,
        serializedIndex: setIndex
      });
    }
  }));
}

many.propTypes = {
  name: _react2.default.PropTypes.string.isRequired,
  serializedPath: _react2.default.PropTypes.array,
  children: _reactImmutableProptypes2.default.list.isRequired
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
  name: _react2.default.PropTypes.string.isRequired,
  value: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.bool, _react2.default.PropTypes.number, _react2.default.PropTypes.string]),
  serializedPath: _react2.default.PropTypes.array,
  serializedIndex: _react2.default.PropTypes.number
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
 * @param  {Object} options Options hash: { prefix: String }
 * @return {Object} A object referencing the various React components above
 */

function serialize() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var prefix = options.prefix;

  var additionalProps = {
    serializedPath: prefix ? [prefix] : []
  };
  return {
    fields: {
      bool: wrapComponent(input, additionalProps),
      int: wrapComponent(input, additionalProps),
      date: wrapComponent(input, additionalProps),
      date_time: wrapComponent(input, additionalProps),
      decimal: wrapComponent(input, additionalProps),
      float: wrapComponent(input, additionalProps),
      string: wrapComponent(input, additionalProps)
    },
    attr: wrapComponent(attr, additionalProps),
    many: wrapComponent(many, additionalProps),
    group: passThrough,
    section: passThrough
  };
}