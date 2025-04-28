import { defineStore } from 'pinia'
import api from '@/api'

interface CounterState {
  count: number
}

export const useCounterStore = defineStore('counter', {
  state: (): CounterState => ({
    count: 0,
  }),
  getters: {
  },
  actions: {
  }
})
