const promisify = (library, ...methods) => {
  const promisifiedMethods = Object.create(null)
  if (!methods.length) {
    for (let property in library) {
      if (typeof library[property] === 'function') methods.push(property)
    }
  }

  for (let method of methods) {
    promisifiedMethods[method] = (...args) => {
      return new Promise((resolve, reject) => {
        library[method].call(library, ...args, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })
    }
  }

  return promisifiedMethods
}

const flatten = array => {
  let results = []
  for (let element of array) {
    if (Array.isArray(element)) {
      results = results.concat(flatten(element))
    } else {
      results.push(element)
    }
  }
  return results
}

module.exports = {
  promisify,
  flatten
}
