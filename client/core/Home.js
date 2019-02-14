import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Card, {CardContent, CardMedia} from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import seashellImg from './../assets/images/seashell.jpg'
import {Link} from 'react-router-dom'
import Grid from 'material-ui/Grid'
import auth from './../auth/auth-helper'
import FindPeople from './../user/FindPeople'
import Newsfeed from './../post/Newsfeed'

import MediaList from '../media/MediaList'
import {listPopular,listSportsRelated,listGenreRelated,listBollywoodRelated,
  listHollywoodRelated,
  listPoliticsRelated,
  listTelevisionRelated} from '../media/api-media.js'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  card: {
    maxWidth: 600,
    margin: 'auto',
    marginTop: theme.spacing.unit * 5
  },
  title: {
    padding:`${theme.spacing.unit * 3}px ${theme.spacing.unit * 2.5}px ${theme.spacing.unit * 2}px`,
    color: theme.palette.text.secondary
  },
  media: {
    minHeight: 330
  }
})

class Home extends Component {
  state = {
    defaultPage: true,
    media:[],
    sportsmedia:[],
    bollywoodmedia:[],
    hollywoodmedia:[],
    politicsmedia:[],
    televisionmedia:[]  
  }
loadRelatedVideos = () => {
  listSportsRelated().then((data) => {
    if (data.error) {
      console.log(data.error)
    } else {
      console.log(data);
      this.setState({sportsmedia: data})
    }
  })

  /*listGenreRelated({
    genre: 'Bollywood'}).then((data) => {
    if (data.error) {
      console.log(data.error)
    } else {
      this.setState({bollywoodmedia: data})

      console.log("bollywoodmedia "+JSON.stringify(data));
    }
  })*/
  listBollywoodRelated().then((data) => {
    if (data.error) {
      console.log(data.error)
    } else {
      console.log("bollywoodmedia "+JSON.stringify(data));
      this.setState({bollywoodmedia: data})
    }
  })
  listHollywoodRelated().then((data) => {
    if (data.error) {
      console.log(data.error)
    } else {
      this.setState({hollywoodmedia: data})
    }
  })
  listPoliticsRelated().then((data) => {
    if (data.error) {
      console.log(data.error)
    } else {
      this.setState({politicsmedia: data})
    }
  })
  listTelevisionRelated().then((data) => {
    if (data.error) {
      console.log(data.error)
    } else {
      this.setState({televisionmedia: data})
    }
  })

}
  componentDidMount = () => {
    this.init();
    listPopular().then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        this.setState({media: data})
      }
    });

    this.loadRelatedVideos();
  }

  init = () => {
    if(auth.isAuthenticated()){
      this.setState({defaultPage: false})
    }else{
      this.setState({defaultPage: true})
    }
  }
  componentWillReceiveProps = () => {
    this.init()
  }
  
  render() {
    const {classes} = this.props
    return (
      <div className={classes.root}>
        {this.state.defaultPage &&
          <Grid container spacing={24}>
            <Grid item xs={12}>
              
              
        <Typography type="headline" component="h2" className={classes.title}>
          Popular Videos
        </Typography>
          <MediaList media={this.state.media}/>
      
      <Typography type="headline" component="h2" className={classes.title}>
          Sports Videos
        </Typography>
      <MediaList media={this.state.sportsmedia}/>

       <Typography type="headline" component="h2" className={classes.title}>
          Bollywood Videos
        </Typography>
      <MediaList media={this.state.bollywoodmedia}/>

      <Typography type="headline" component="h2" className={classes.title}>
          Hollywood Videos
        </Typography>
      <MediaList media={this.state.hollywoodmedia}/>

      
      <Typography type="headline" component="h2" className={classes.title}>
          Politics Videos
        </Typography>
      <MediaList media={this.state.politicsmedia}/>

      <Typography type="headline" component="h2" className={classes.title}>
          Television Videos
        </Typography>
      <MediaList media={this.state.televisionmedia}/>

            </Grid>
          </Grid>
        }
        {!this.state.defaultPage &&
          <Grid container spacing={24}>
            <Grid item xs={8} sm={7}>
              <Newsfeed/>
            </Grid>
            <Grid item xs={6} sm={5}>
              <FindPeople/>
            </Grid>
          </Grid>
        }
      </div>
    )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home)
