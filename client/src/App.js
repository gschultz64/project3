import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import { UserProfile } from './UserProfile';
import PhotoForm from './PhotoForm';
import Navbar from './Navbar';
import Home from './Home';
import Result from './Result';
import CssBaseline from '@material-ui/core/CssBaseline';


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      token: '',
      user: null,
      lockedResult: '',
      playlist: [],
      spotifyToken: '',
      imgURL: '',
      genres: [],
      cloudColors: []
    }
    this.checkForLocalToken = this.checkForLocalToken.bind(this);
    this.checkForSpotifyToken = this.checkForSpotifyToken.bind(this);
    this.logout = this.logout.bind(this);
    this.liftTokenToState = this.liftTokenToState.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handlePlaylist = this.handlePlaylist.bind(this);
    this.handlePhoto = this.handlePhoto.bind(this);
    this.handleColors = this.handleColors.bind(this);
    this.handleGenres = this.handleGenres.bind(this);
  }

  liftTokenToState(data) {
    this.setState({
      token: data.token,
      user: data.user
    })
  }

  handleClick(e) {
    e.preventDefault();
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.state.token}`;
    axios.get('/locked/test').then(results => {
      this.setState({
        lockedResult: results.data
      })
    })
  }

  componentDidMount() {
    this.checkForLocalToken();
    this.checkForSpotifyToken()
  }

  logout() {
    // remove token from local storage
    localStorage.removeItem('mernToken');
    // remove info from state
    this.setState({
      token: '',
      user: null
    })
  }

  checkForSpotifyToken() {
    //Look for Spotify token in local storage
    let spotifyToken = localStorage.getItem('spotifyToken');
    console.log('checking for sfy token')
    if (!spotifyToken || spotifyToken == 'undefined') {
      // There was no token
      // clear out anything weird that might be there
      console.log('no sfy token found')
      localStorage.removeItem('spotifyToken')
      this.setState({
        spotifyToken: '',
      })
      // we need to call the Spotify API on the back end and get a token
      axios.post('/auth/get/spotify/token').then(results => {
        console.log('trying to hit route on back end')
        // put the token in local storage
        console.log(results.data)
        localStorage.setItem('spotifyToken', results.data.access_token);
        this.setState({
          spotifyToken: results.data.access_token,
        })
      }).catch(err => console.log(err))
    }
  }

  checkForLocalToken() {
    //Look for token in local storage
    let token = localStorage.getItem('mernToken');
    if (!token) {
      // There was no token
      // remove mernToken from local storage just in case corrupted, replaced etc
      localStorage.removeItem('mernToken')
      this.setState({
        token: '',
        user: null
      })
    } else {
      // token found in local storage
      // send it to the back to be verified
      axios.post('/auth/me/from/token', {
        token
      }).then(results => {
        // put the token in local storage
        localStorage.setItem('mernToken', results.data.token);
        this.setState({
          token: results.data.token,
          user: results.data.user
        })
      }).catch(err => console.log(err))
    }
  }
  
  // ******** THESE HANDLE THE THINGS THAT NEED TO BE PASSED FROM PHOTOFORM TO RESULTS/PLAYLIST
  handlePlaylist(tracks) {
    this.setState({
      playlist: tracks
    }, () => { console.log('The Playlist:', this.state.playlist) });
  }

  handlePhoto(photo) {
    this.setState({
      imgURL: photo
    });
  }

  handleGenres(genres) {
    this.setState({
      genres: genres
    });
  }

  handleColors(colors) {
    this.setState({
      cloudColors: colors
    });
  }
  // **********************


  render() {
    let user = this.state.user;
    let results = (this.state.playlist.length) ? <Result playlist={this.state.playlist} 
                                                         imgURL={this.state.imgURL}
                                                         genres={this.state.genres}
                                                         colors={this.state.cloudColors}
                                                         user={user} /> : '';
    if (user) {
      return (
        <div className="App">
          <Router>
            <div>
              <Navbar />
              <UserProfile user={user} logout={this.logout}/>
              <a onClick={this.handleClick}> Test the protected route</a>
              <p>{this.state.lockedResult}</p>
            </div>
          </Router>


          <UserProfile user={user} logout={this.logout} />

          <a onClick={this.handleClick}> Test the protected route</a>
          <p>{this.state.lockedResult}</p>

          <PhotoForm liftPlaylist={this.handlePlaylist} 
                     liftPhoto={this.handlePhoto}
                     liftGenres={this.handleGenres}
                     liftColors={this.handleColors}
                     refreshToken={this.checkForSpotifyToken} />
          {results}
        </div>
      );
    } else {
      return (
        <div className="App">
          <Router>
            <div>
              <Navbar />

              <Route exact path='/' render={() =>
                <Home />
              } />

              <Route path='/signup' render={() =>
                <Signup liftToken={this.liftTokenToState} />
              } />

              <Route path='/login' render={() =>
                <Login liftToken={this.liftTokenToState} />
              } />
            </div>
          </Router>
          
          <PhotoForm liftPlaylist={this.handlePlaylist} 
                     liftPhoto={this.handlePhoto}
                     liftGenres={this.handleGenres}
                     liftColors={this.handleColors}
                     refreshToken={this.checkForSpotifyToken} />
          {results}
        </div>
      )
    }
  }
}


export default App;
