# Formalist Serialize React

A React serializer for a Formalist-compatible abstract syntax tree. It’ll take your complex, nested AST and output a series of flat hidden-inputs.

## Usage

```js
import composeForm from 'formalist-compose'
import serialize from 'formalist-serialize-react'

const data = [...] // Formalist compatible AST

const serializedTemplate = composeForm(serialize())
const serializedForm = serializedTemplate(data)

// serializedForm.render()
```

You can set a prefix for the input names:

```
let options = {
  prefix: "user"
}
const serializedTemplate = composeForm(serialize(options))

// <input name="user[foo]" type="hidden"/>
```

## Development

### Installation

```
npm install
npm install react react-dom react-addons-test-utils
```

## Tests

```
npm run test
```
