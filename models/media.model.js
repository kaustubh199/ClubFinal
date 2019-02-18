import mongoose from 'mongoose'
import crypto from 'crypto'
const MediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: 'title is required'
  },
  description: {
    type: String,
    required: 'description is required'
  },
  genre:{
    type: String,
    required: 'genre is required'
  },
  views: {type: Number, default: 0},
  likes: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  dislikes: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  comments: [{
    text: String,
    created: { type: Date, default: Date.now },
    postedBy: { type: mongoose.Schema.ObjectId, ref: 'User'}
  }],
  postedBy: {type: mongoose.Schema.ObjectId, ref: 'User'},
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  }
})

export default mongoose.model('Media', MediaSchema)
