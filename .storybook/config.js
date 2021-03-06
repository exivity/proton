import React, { Component } from 'react'

import { addDecorator, configure } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import { withOptions } from '@storybook/addon-options'

import { WithStyle } from '@exivity/ui'
import { DataProvider } from 'react-orbitjs'
import dataStore from './orbitStories/store'
import { CrudContext } from '../src/OrbitClient/CrudProvider'

const options = {
  name: '@exivity/proton',
  url: 'https://github.com/exivity/proton',
  showAddonPanel: true,
  addonPanelInRight: true,
  hierarchySeparator: /\/|\./,
  hierarchyRootSeparator: /\|/,
}

const withStyle = story => <div style={{
  padding: "20px"
}}>
  <style>{`h1:first-child { margin-top: 0; }`}</style>
  <WithStyle>
    {story()}
  </WithStyle>
</div>

const addRecord = (record) => dataStore.update(t => t.addRecord(record))
const updateRecord = (record) => dataStore.update(t => t.replaceRecord(record))
const removeRecord = (record) => dataStore.update(t => t.removeRecord(record))

const crud = {
  addRecord,
  updateRecord,
  removeRecord,
  performTransforms: (transforms) => dataStore.update(transforms)
}

class Provider extends Component {
  constructor (props) {
    super(props)

    this.state = {
      render: false
    }
  }

  componentDidMount () {
    this.timeout = setTimeout(() => this.setState({ render: true }) , 300)
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  render () {
    if (!this.state.render) return null

    return (
      <CrudContext.Provider value={crud}>
        <DataProvider dataStore={dataStore}>
          { this.props.story() }
        </DataProvider>
      </CrudContext.Provider>
    )
  }
}

// add decorators
addDecorator(withInfo)
addDecorator(withOptions(options))
addDecorator(withStyle)
addDecorator((story) => <Provider story={story} />)

// automatically import all files ending in *.stories.js
const req = require.context('../src', true, /.stories.js$/)

function loadStories () {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
