import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Card from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import Divider from 'material-ui/Divider'
import auth from './../auth/auth-helper'
import PostList from './PostList'
import PostListMedia from './PostListMedia'
import {listNewsFeed,listNewsFeedVideos} from './api-post.js'
import {listByUserMedia} from './../media/api-media.js'
import MediaList from './../media/MediaList'

import NewPost from './NewPost'
import {read} from './../user/api-user.js'


const styles = theme => ({
  card: {
    margin: 'auto',
    paddingTop: 0,
    paddingBottom: theme.spacing.unit*3
  },
  title: {
    padding:`${theme.spacing.unit * 3}px ${theme.spacing.unit * 2.5}px ${theme.spacing.unit * 2}px`,
    color: theme.palette.openTitle,
    fontSize: '1em'
  },
  media: {
    minHeight: 330
  }
})
class Newsfeed extends Component {
  state = {
      posts: [],
      media: []
  }
  loadPosts = () => {
    const jwt = auth.isAuthenticated()
    listNewsFeed({
      userId: jwt.user._id
    }, {
      t: jwt.token
    }).then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        this.setState({posts: data})
      }
    })
  }

  loadVideoPosts = () => {
    const jwt = auth.isAuthenticated()

    listByUserMedia({
      userId:jwt.user._id
    }).then((media)=>{
      if(media.error){
        console.log(media.error)
      }
      else{
        this.setState({media: media})
      }
    })
  }

    
 
  componentDidMount = () => {
    this.loadPosts();
    this.loadVideoPosts();
  }
  addPost = (post) => {
    const updatedPosts = this.state.posts
    updatedPosts.unshift(post)
    this.setState({posts: updatedPosts})
  }
  removePost = (post) => {
    const updatedPosts = this.state.posts
    const index = updatedPosts.indexOf(post)
    updatedPosts.splice(index, 1)
    this.setState({posts: updatedPosts})
  }
  removeMediaPost = (post) => {
    const updatedMedia = this.state.media
    const mediaIndex = updatedMedia.indexOf(post)
    updatedMedia.splice(mediaIndex, 1)
    this.setState({media: updatedMedia})
  }
  
  render() {
    const {classes} = this.props
    return (
      <div>
      <Card className={classes.card}>
        <Typography type="title" className={classes.title}>
          Newsfeed
        </Typography>
        <Divider/>
        <NewPost addUpdate={this.addPost}/>
        <Divider/>
        <PostList removeUpdate={this.removePost} posts={this.state.posts}/>
      </Card>

<Card className={classes.card}>
<Typography type="title" className={classes.title}>
  Newsfeed Videos
</Typography>
<Divider/>
<Divider/>
<MediaList media={this.state.media}/>
</Card>

<Card className={classes.card}>
<Typography type="title" className={classes.title}>
  Newsfeed Videos New Component
</Typography>
<Divider/>
<PostListMedia removeMediaUpdate={this.removeMediaPost} posts={this.state.media}/>
</Card>

</div>
    )
  }
}
Newsfeed.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Newsfeed)
