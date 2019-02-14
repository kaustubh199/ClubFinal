import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Media from './Media'
import MediaNewsFeed from './MediaNewsFeed';

class MediaListNewsFeed extends Component {
  render() {
    return (
      <div style={{marginTop: '24px'}}>
        {this.props.medias.map((item, i) => {
            return <MediaNewsFeed media={item} key={i} onRemove={this.props.removeUpdate}/>
          })
        }
      </div>
    )
  }
}
MediaListNewsFeed.propTypes = {
  medias: PropTypes.array.isRequired,
  removeUpdate: PropTypes.func.isRequired
}
export default MediaListNewsFeed
