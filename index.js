const { promisify, flatten } = require('./utils')
const { readFile, stat, readdir } = promisify(require('fs'), 'readFile', 'stat', 'readdir')

const searchFile = async (filename, searchExpression) => {
  let fileBody
  try {
    fileBody = await readFile(filename)
  } catch (e) {
    console.error(filename, 'not found', e)
    return
  }
  if (searchExpression.test(fileBody)) {
    return Promise.resolve(filename)
  }
  return Promise.resolve(false)
}

const searchFiles = async (previousPath, files, searchExpression) => {
  let results = []
  const currentPath = previousPath + '\\'
  let stats
  for (let file of files) {
    try {
      stats = await stat(currentPath + file)
    } catch (e) {
      console.error('error retreiving stats from', file, e)
      process.exit(1)
    }
    if (stats.isDirectory()) {
      results = results.concat(searchFiles(currentPath + file, await readdir(file), searchExpression))
    } else {
      results.push(searchFile(currentPath + file, searchExpression))
    }
  }
  return Promise.all(results)
}

const printHelp = () => {
  console.log(
    `Usage: 
    - The first argument provided is a regular expression (or string) (required)
    - The next arguments are what files or directories to search in.  If none are provided, the current directory is searched.
    `
  )
}

const main = (async () => {
  if (process.argv.includes('--help')) {
    printHelp()
    process.exit(0)
  }
  const searchExpression = new RegExp(process.argv[2])
  let files = process.argv.slice(3)

  if (!files.length) {
    files = await readdir('.')
    files = files.filter(file => !file.startsWith('.'))
  }

  searchFiles(process.cwd(), files, searchExpression)
    .then(results => flatten(results))
    .then(flattenedResults => flattenedResults.filter(i => i))
    .then(filteredResults => {
      console.log('\n--Search complete--')
      if (!filteredResults.length) {
        console.log('No matches found')
      } else {
        console.log('Matches found in the following files:')
        filteredResults.forEach(result => console.log(result))
      }
    })
})()
