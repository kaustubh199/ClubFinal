import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import PostMedia from './PostMedia'

class PostListMedia extends Component {
  render() {
    return (
      <div style={{marginTop: '24px'}}>
        {this.props.posts.map((item, i) => {
            return <PostMedia post={item} key={i} onRemove={this.props.removeMediaUpdate}/>
          })
        }
      </div>
    )
  }
}
PostListMedia.propTypes = {
  posts: PropTypes.array.isRequired,
  removeMediaUpdate: PropTypes.func.isRequired
}
export default PostListMedia
