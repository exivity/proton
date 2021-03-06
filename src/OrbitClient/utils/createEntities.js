#!/usr/bin/env node

const fs = require('fs')
const babel = require('@babel/core')
const pluralize = require('pluralize')

const pathUtils = './node_modules/@exivity/proton/src/OrbitClient/utils'

fs.readFile('./occonfig.json', 'utf8', (err, data) => {
  if (err) throw err
  const relativeSchemaPath = JSON.parse(data).schema
  const relativeTargetPath = JSON.parse(data).target + '/OrbitClient'
  const pathEntities = relativeTargetPath + '/entity'

  if (!fs.existsSync(relativeTargetPath)) {
    fs.mkdirSync(relativeTargetPath)
  }

  if (!fs.existsSync(pathEntities)) {
    fs.mkdirSync(pathEntities)
  }

  fs.readFile(relativeSchemaPath, 'utf8', (err, data) => {
    if (err) throw err
    babel.transformFile(relativeSchemaPath, {
      presets: [ '@babel/preset-env']
    }, (err, result) => {
      if (err) throw err
      fs.writeFile('./tempSchema.js', result.code, (err) => {
        if (err) throw err
        console.log('Created temporary schema file...')
        const schema = require('../../../../../../tempSchema')
        const models = Object.keys(schema.default.models)

        models.forEach((model) => {
          createRecordComponent(model, pathEntities)
          createRecordsComponent(model, pathEntities)
        })

        fs.unlink('./tempSchema.js', (err) => {
          if (err) throw err
          console.log('Deleted temporary schema file...')
        })
      })
    })
  })
})

const capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join('')

const createRecordComponent = (model, savePath) => {
  fs.readFile(pathUtils + '/templates/entity.js', 'utf8', (err, result) => {
    if (err) throw err
    const capitalizedModel = capitalize(model)
    const component = result.replace(/_Entity/g, capitalizedModel)
    const finished = component.replace(/_entity/g, model)

    const path = savePath + '/' + capitalizedModel + '.js'
    fs.writeFile(path, finished, (err) => {
      if (err) throw err
      console.log('Created: ', path)
    })
  })
}

const createRecordsComponent = (model, savePath) => {
  fs.readFile(pathUtils + '/templates/entities.js', 'utf8', (err, result) => {
    if (err) throw err
    const capitalizedModel = pluralize(capitalize(model))
    const Entities = result.replace(/_Entities/g, capitalizedModel)
    const entity = Entities.replace(/_entity/g, model)
    const entities = entity.replace(/_entities/g, pluralize(model))

    const path = savePath + '/' + capitalizedModel + '.js'
    fs.writeFile(path, entities, (err) => {
      if (err) throw err
      console.log('Created: ', path)
    })
  })
}
