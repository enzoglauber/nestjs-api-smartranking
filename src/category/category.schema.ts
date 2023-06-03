import mongoose from 'mongoose'

export const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true
    },
    description: String,
    events: [
      {
        name: String,
        operation: String,
        value: Number
      }
    ],
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      }
    ]
  },
  {
    timestamps: true,
    collection: 'Category'
  }
)
