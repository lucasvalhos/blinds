import { EventEmitter } from 'events'

import AppDispatcher from '../dispatcher/AppDispatcher'
import AppConstants from '../constants/AppConstants'

import RoundActionCreators from '../actions/RoundActionCreators'
import TimerActionCreators from '../actions/TimerActionCreators'

import RoundStore from './RoundStore'


const CHANGE_EVENT = 'change'

const TIMER_STOPPED = 'stopped'
const TIMER_STARTED = 'started'
const TIMER_PAUSED = 'paused'
const TIMER_ENDED = 'ended'


let _data = {
  status: TIMER_STOPPED,
  interval: undefined,
  length: 0,
  remaining: 0
}


class TimerStore extends EventEmitter {
  emitChange() {
    this.emit(CHANGE_EVENT)
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback)
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback)
  }

  getStatus() {
    return _data.status
  }

  getLength() {
    return _data.length
  }

  getRemaining() {
    return _data.remaining
  }
}


let _instance = new TimerStore()


function _tick() {
  if (_data.length > 0) {
    _data.remaining -= 1

    if (_data.remaining < 0) {
      _data.status = TIMER_ENDED
      _data.remaining = 0

      clearInterval(_data.interval)
      _data.interval = undefined

      let active = RoundStore.getActive()
      let nextRound = RoundStore.getRound(active + 1)

      if (nextRound.type == 'round') {
        RoundActionCreators.setActiveRound(active + 1)
        TimerActionCreators.startTimer()
      }
    }
  } else {
    _data.remaining += 1
  }

  _instance.emitChange()
}


_instance.dispatchToken = AppDispatcher.register(action => {
  switch(action.type) {
    case AppConstants.ROUND_SET_ACTIVE:
    AppDispatcher.waitFor([RoundStore.dispatchToken])

    let active = RoundStore.getActive()
    let round = RoundStore.getRound(active)

    _data.status = TIMER_STOPPED
    _data.length = round.length
    _data.remaining = _data.length

    clearInterval(_data.interval)
    _data.interval = undefined

    _instance.emitChange()
    break

    case AppConstants.TIMER_INIT:
    _data.status = TIMER_STOPPED
    _data.length = action.length
    _data.remaining = _data.length

    clearInterval(_data.interval)
    _data.interval = undefined

    _instance.emitChange()
    break;

    case AppConstants.TIMER_START:
    _data.status = TIMER_STARTED
    _data.interval = setInterval(_tick, 1000)

    _instance.emitChange()
    break;

    case AppConstants.TIMER_PAUSE:
    _data.status = TIMER_PAUSED

    clearInterval(_data.interval)
    _data.interval = undefined

    _instance.emitChange()
    break;

    case AppConstants.TIMER_RESET:
    _data.status = TIMER_STOPPED
    _data.remaining = _data.length

    clearInterval(_data.interval)
    _data.interval = undefined

    _instance.emitChange()
    break;

    case AppConstants.TIMER_TICK:
    if (_data.length > 0) {
      _data.remaining -= 1

      if (_data.remaining <= 0) {
        _data.status = TIMER_ENDED
        _data.remaining = 0

        clearInterval(_data.interval)
        _data.interval = undefined
      }
    } else {
      _data.remaining += 1
    }
    _instance.emitChange()
    break;

    default:
    break
  }
})


export default _instance
