import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Paper from 'material-ui/Paper'
import List, {ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText} from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import Typography from 'material-ui/Typography'
import {Link} from 'react-router-dom'
import {findPeople, follow} from './api-user.js'
import auth from './../auth/auth-helper'
import Snackbar from 'material-ui/Snackbar'
import ViewIcon from 'material-ui-icons/Visibility'

const styles = theme => ({
  root: theme.mixins.gutters({
    padding: theme.spacing.unit,
    margin: 0
  }),
  title: {
    margin: `${theme.spacing.unit * 3}px ${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    color: theme.palette.openTitle,
    fontSize: '1em'
  },
  avatar: {
    marginRight: theme.spacing.unit * 1
  },
  follow: {
    right: theme.spacing.unit * 2
  },
  snack: {
    color: theme.palette.protectedTitle
  },
  viewButton: {
    verticalAlign: 'middle'
  }
})

function searchingFor(term){
	return function(x){
		return x.name.toLowerCase().includes(term.toLowerCase()) || !term;
	}
}




class FindPeople extends Component {
  constructor(props){
		super(props);
	this.state = {
      users: [],
	  term:'',
      open: false
	}
	this.searchHandler = this.searchHandler.bind(this);
	}
	
	searchHandler(event){
		this.setState({term: event.target.value})	
	}
  componentDidMount = () => {
    const jwt = auth.isAuthenticated()
    findPeople({
      userId: jwt.user._id
    }, {
      t: jwt.token
    }).then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        data.sort(function(a, b){return b.followers.length - a.followers.length});
        this.setState({users: data})
        //console.log("users "+JSON.stringify(data));
      }
    })
  }
  clickFollow = (user, index) => {
    const jwt = auth.isAuthenticated()
    follow({
      userId: jwt.user._id
    }, {
      t: jwt.token
    }, user._id).then((data) => {
      if (data.error) {
        this.setState({error: data.error})
      } else {
        let toFollow = this.state.users
        toFollow.splice(index, 1)
        this.setState({users: toFollow, open: true, followMessage: `Following ${user.name}!`})
      }
    })
  }
  handleRequestClose = (event, reason) => {
    this.setState({ open: false })
  }
  render() {
    const {classes} = this.props
    return (<div>

<form align = "center">
<input type="text" placeholder="Search People.."   onChange={this.searchHandler}/>
</form>

      <Paper className={classes.root} elevation={4}>
        <Typography type="title" className={classes.title}>
          Who to follow
        </Typography>
        <List>
          {this.state.users.filter(searchingFor(this.state.term)).map((item, i) => {
              return <span key={i}>
                <ListItem>
                  <ListItemAvatar className={classes.avatar}>
                      <Avatar src={'/api/users/photo/'+item._id}/>
                  </ListItemAvatar>
                  <ListItemText primary={item.name}/>
                  <ListItemSecondaryAction className={classes.follow}>
                    <Link to={"/user/" + item._id}>
                      <IconButton variant="raised" color="secondary" className={classes.viewButton}>
                        <ViewIcon/>
                      </IconButton>
                    </Link>
                    {item.followers.length} Followers
                  </ListItemSecondaryAction>
                </ListItem>
              </span>
            })
          }
        </List>
      </Paper>
      <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={this.state.open}
          onClose={this.handleRequestClose}
          autoHideDuration={6000}
          message={<span className={classes.snack}>{this.state.followMessage}</span>}
      />
    </div>)
  }
}

FindPeople.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(FindPeople)
