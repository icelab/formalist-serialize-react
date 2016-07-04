# Formalist Serialize React

A React serializer for a Formalist-compatible abstract syntax tree. It’ll take your complex, nested AST and output a series of flat hidden-inputs.

## Usage

```js
import serialize from 'formalist-serialize-react'
const data = [...] // Formalist compatible AST
serialize(data)
// <input name="foo" value="bar" type="hidden"/>
```

You can set a prefix for the input names:

```js
let options = {
  prefix: "user"
}
serialize(data, options)
// <input name="user[foo]" value="bar" type="hidden"/>
```

## Tests

```
$ npm run test
```
