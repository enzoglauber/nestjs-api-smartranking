import * as mongoose from 'mongoose'

export const ChallengeSchema = new mongoose.Schema(
  {
    when: { type: Date },
    status: { type: String },
    request: { type: Date },
    response: { type: Date },
    // requester: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    requester: { type: mongoose.Schema.Types.ObjectId },
    // category: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId
        // ref: 'Player'
      }
    ],
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    }
  },
  { timestamps: true, collection: 'challenges' }
)
