export interface Category {
  readonly _id: string
  readonly name: string
  description: string
  events: Event[]
}

export interface Event {
  name: string
  description?: string
  operation: string
  value: number
}
