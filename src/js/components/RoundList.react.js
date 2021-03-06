import React, { Component } from 'react'

import classNames from 'classnames'

import RoundActionCreators from '../actions/RoundActionCreators'

import TimerStore from '../stores/TimerStore'
import RoundStore from '../stores/RoundStore'

import RoundBlinds from './RoundBlinds.react.js'


class BreakItem extends Component {
  render() {
    return (
      <div className="break-item">Break</div>
    )
  }
}


class RoundList extends Component {
  constructor(props) {
    super(props)

    this.state = this._getStateFromStores()
  }

  componentDidMount() {
    TimerStore.addChangeListener(this._onChange.bind(this))
    RoundStore.addChangeListener(this._onChange.bind(this))
  }

  componentWillUnmount() {
    TimerStore.removeChangeListener(this._onChange.bind(this))
    RoundStore.removeChangeListener(this._onChange.bind(this))
  }

  render() {
    return (
      <div id="rounds">
        {this.state.rounds.map((round, i) => {
          let classes = ['round-item']

          if (i == this.state.active) {
            classes.push('active')
          }

          return (
            <div key={i} className={classNames(classes)} onClick={event => {
              if (this.state.timerStatus == 'stopped' || this.state.timerStatus == 'ended') {
                RoundActionCreators.setActiveRound(i)
              }
            }}>
              <span className="round-number">{round.type == 'round' ? round.round : ''}</span> 
              {round.type == 'round' ? <RoundBlinds smallBlind={round.smallBlind} bigBlind={round.bigBlind} /> : <BreakItem />}
            </div>
          )
        })}
      </div>
    )
  }

  _getStateFromStores() {
    return {
      active: RoundStore.getActive(),
      rounds: RoundStore.getRounds(),
      timerStatus: TimerStore.getStatus()
    }
  }

  _onChange() {
    this.setState(this._getStateFromStores())
  }
}


export default RoundList
