import React, { PureComponent } from 'react'
import { withData } from 'react-orbitjs'


// Still needs to be developed
class OrbitClient extends PureComponent {
  componentDidMount () {
    const { _entities } = this.props

    if (!_entities.length) {
      this.setState({
        loading: true,
      }, this.queryStore)
    }
  }

  findOne = (id) => {
    const { _entities } = this.props

    return _entities.find(item => item.id === id)
  }

  find = (ids) => {
    const { _entities } = this.props

    return ids.map(id =>  _entities.find(item => item.id === id))
  }

  findByAttribute = ({ attribute, value }) => {
    const { _entities } = this.props

    return _entities.filter(item => item.attributes[attribute] === value)
  }

  buildSaveTransforms = (records) => (t) => records.map((record) => {
    if (record.id) {
      return t.replaceRecord(record)
    }
    return t.addRecord(record)
  })

  buildRemoveTransforms = (records) => (t) => records.map((record) => {
    return t.removeRecord(record)
  })

  queryStore = async () => {
    try {
      await this.props.queryStore(q => q.findRecords('_entity'))
      this.setState({ loading: false })
    } catch (error) {
      this.setState({
        loading: false
      })
    }
  }
  render () {
    if (this.props.query) {
      const queryKeys = Object.keys(this.props.query)
      const queryHandlers = queryKeys.reduce((handlers, query) => {
        handlers[query] = this.props[query]
        return handlers
      }, {})

      return (
        <WrappedComponent {...this.props} key={this.props.id}>
          {(handlers) => this.props.children({
            ...handlers,
            ...queryHandlers
          })}
        </WrappedComponent>
      )
    }

    return null
  }
}

const mapRecordsToProps = (ownProps) => {
  if (ownProps.query) {
    return ownProps.query
  }

  return {}
}

export default withData(mapRecordsToProps)(OrbitClient)
