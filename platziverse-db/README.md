# platziver-db

## Usage

```js
const setupDatabase = require('plaziverse-db')

setupDatabase(config).them(db => {
    const { Agent, Metric } = db

}).catch(err => console.error(err))
```
