import Media from '../models/media.model'
import _ from 'lodash'
import errorHandler from '../helpers/dbErrorHandler'
import formidable from 'formidable'
import fs from 'fs'

//media streaming
import mongoose from 'mongoose'
//import Grid from 'gridfs-stream'
 /* Temporary fix for Mongoose v5+ and gridfs-stream v1.1.1 bug */
const Grid = require('gridfs-stream');
eval(`Grid.prototype.findOne = ${Grid.prototype.findOne.toString().replace('nextObject', 'next')}`);
/* Until gridfs-stream module is updated */
Grid.mongo = mongoose.mongo
let gridfs = null
mongoose.connection.on('connected', () => {
  gridfs = Grid(mongoose.connection.db)
})

const create = (req, res, next) => {
  let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Video could not be uploaded"
        })
      }
      let media = new Media(fields)
      media.postedBy= req.profile
      if(files.video){
        let writestream = gridfs.createWriteStream({_id: media._id})
        fs.createReadStream(files.video.path).pipe(writestream)
      }
      media.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
          })
        }
        res.json(result)
      })
    })
}

const mediaByID = (req, res, next, id) => {
  Media.findById(id).populate('postedBy', '_id name').exec((err, media) => {
    if (err || !media)
      return res.status('400').json({
        error: "Media not found"
      })
    req.media = media
    next()
  })
}

const video = (req, res) => {
  gridfs.findOne({
        _id: req.media._id
    }, (err, file) => {
        if (err) {
            return res.status(400).send({
                error: errorHandler.getErrorMessage(err)
            })
        }
        if (!file) {
            return res.status(404).send({
                error: 'No video found'
            })
        }

        if (req.headers['range']) {
            let parts = req.headers['range'].replace(/bytes=/, "").split("-")
            let partialstart = parts[0]
            let partialend = parts[1]

            let start = parseInt(partialstart, 10)
            let end = partialend ? parseInt(partialend, 10) : file.length - 1
            let chunksize = (end - start) + 1

            res.writeHead(206, {
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
                'Content-Type': file.contentType
            })

            gridfs.createReadStream({
                _id: file._id,
                range: {
                    startPos: start,
                    endPos: end
                }
            }).pipe(res)
        } else {
            res.header('Content-Length', file.length)
            res.header('Content-Type', file.contentType)

            gridfs.createReadStream({
                _id: file._id
            }).pipe(res)
        }
    })
}

const listPopular = (req, res) => {
  Media.find({}).limit(9)
  .populate('postedBy', '_id name')
  .sort('-views')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const listByUser = (req, res) => {
  Media.find({postedBy: req.profile._id})
  .populate('postedBy', '_id name')
  .sort('-created')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const listMediaByUser = (req, res) => {
  let following = req.profile.following
  following.push(req.profile._id)
  Media.find({postedBy: { $in : req.profile.following } })
  .populate('comments', 'text created')
  .populate('comments.postedBy', '_id name')
  .populate('postedBy', '_id name')
  .sort('-created')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const read = (req, res) => {
  return res.json(req.media)
}

const incrementViews = (req, res, next) => {
  Media.findByIdAndUpdate(req.media._id, {$inc: {"views": 1}}, {new: true})
      .exec((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
          })
        }
        next()
      })
}

const update = (req, res, next) => {
  let media = req.media
  media = _.extend(media, req.body)
  media.updated = Date.now()
  media.save((err) => {
    if (err) {
      return res.status(400).send({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(media)
  })
}

const isPoster = (req, res, next) => {
  let isPoster = req.media && req.auth && req.media.postedBy._id == req.auth._id
  if(!isPoster){
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

const remove = (req, res, next) => {
  let media = req.media
    media.remove((err, deletedMedia) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      gridfs.remove({ _id: req.media._id })
      res.json(deletedMedia)
    })
}

const listRelated = (req, res) => {
  Media.find({ "_id": { "$ne": req.media }, "genre": req.media.genre}).limit(4)
  .sort('-views')
  .populate('postedBy', '_id name')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const listSportsRelated = (req, res) => {
  Media.find({ "genre":'Sports'}).limit(6)
  .sort('-views')
  .populate('postedBy', '_id name')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const listBollywoodRelated = (req, res) => {
  Media.find({ "genre":'Bollywood'}).limit(6)
  .sort('-views')
  .populate('postedBy', '_id name')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const listHollywoodRelated = (req, res) => {
  Media.find({ "genre":'Hollywood'}).limit(6)
  .sort('-views')
  .populate('postedBy', '_id name')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const listPoliticsRelated = (req, res) => {
  Media.find({ "genre":'Politics'}).limit(6)
  .sort('-views')
  .populate('postedBy', '_id name')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const listTelevisionRelated = (req, res) => {
  Media.find({ "genre":'Television'}).limit(6)
  .sort('-views')
  .populate('postedBy', '_id name')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const listGenreRelated = (req, res) => {
  console.log("On Server"+req)
  Media.find({ "genre":req.genre}).limit(6)
  .sort('-views')
  .populate('postedBy', '_id name')
  .exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(posts)
  })
}

const like = (req, res) => {
  console.log("On Server req.body.mediaId  "+req.body.mediaId+" req.body.userId  "+req.body.userId);
  //console.log("req.body.userId  "+req.body.userId);
  Media.findByIdAndUpdate(req.body.mediaId, {$push: {likes: req.body.userId}}, {new: true})
  //Media.findByIdAndUpdate(ObjectId("5c3c3f0f28dc651aa0314021"), {$push: {likes: req.body.userId}}, {new: true})
  .exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(result)
  })
}

const unlike = (req, res) => {
  console.log("On Server req.body.mediaId  "+req.body.mediaId+" req.body.userId  "+req.body.userId);
  Media.findByIdAndUpdate(req.body.mediaId, {$pull: {likes: req.body.userId}}, {new: true})
  .exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(result)
  })
}


const comment = (req, res) => {
  let comment = req.body.comment
  comment.postedBy = req.body.userId
  Media.findByIdAndUpdate(req.body.mediaId, {$push: {comments: comment}}, {new: true})
  .populate('comments.postedBy', '_id name')
  .populate('postedBy', '_id name')
  .exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(result)
  })
}
const uncomment = (req, res) => {
  let comment = req.body.comment
  Media.findByIdAndUpdate(req.body.mediaId, {$pull: {comments: {_id: comment._id}}}, {new: true})
  .populate('comments.postedBy', '_id name')
  .populate('postedBy', '_id name')
  .exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(result)
  })
}


export default {
  create,
  mediaByID,
  video,
  listPopular,
  listByUser,
  read,
  incrementViews,
  update,
  isPoster,
  remove,
  listRelated,
  listSportsRelated,
  listBollywoodRelated,
  listHollywoodRelated,
  listPoliticsRelated,
  listTelevisionRelated,

  listGenreRelated,
  like,
  unlike,
  comment,
  uncomment,
  listMediaByUser
}
