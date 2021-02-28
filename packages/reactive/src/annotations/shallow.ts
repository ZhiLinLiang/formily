import { createAnnotation, createObservable } from '../internals'
import { buildObservableTree } from '../traverse'
import {
  addDependencyForOperation,
  queueReactionsForOperation,
} from '../reaction'

export const shallow = createAnnotation(({ target, key, value }) => {
  const store = {
    current: createObservable({
      target,
      key,
      value,
      shallow: true,
    }),
  }

  buildObservableTree({
    target,
    key,
    value: store,
  })

  function get() {
    addDependencyForOperation({
      target: target,
      key: key,
      type: 'get',
    })
    return store.current
  }

  function set(value: any) {
    const oldValue = store.current
    value = createObservable({
      target: target,
      key: key,
      value,
      shallow: true,
    })
    store.current = value
    queueReactionsForOperation({
      target: target,
      key: key,
      type: 'set',
      oldValue,
      value,
    })
  }
  if (target) {
    Object.defineProperty(target, key, {
      set,
      get,
      enumerable: true,
      configurable: false,
    })
  }
  return store.current
})