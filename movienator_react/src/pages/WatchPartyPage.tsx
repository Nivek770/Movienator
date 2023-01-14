//Route: movienator3000.com/recommendations
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Movie } from '../types/Movie';
import { useCookies } from 'react-cookie';
import {
  Button,
  Card,
  CardContent,
  Grid,
  InputBase,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { User } from '../types/User';
import { getOneUserToUserId } from '../services/UserService';
import WatchPartyGroupList from '../components/WatchPartyPageComponents/WatchPartyGroupList';
import WatchPartyAddUsersList from '../components/WatchPartyPageComponents/WatchPartyAddUsersList';
import Fuse from 'fuse.js';
import {
  getMoviesToMovieNameSearchQuery,
  getOneMovieToId,
} from '../services/MovieService';
import MoviesList from '../components/ListComponents/MoviesList';
export default function WatchPartyPage() {
  const navigate = useNavigate();
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[] | null>(
    null
  );
  const [cookies] = useCookies(['userName', 'userId']);
  const [user, setUser] = useState<User | null>(null);
  const [usersInGroup, setUsersInGroup] = useState<User[]>([]);
  const [usersInSearch, setUsersInSearch] = useState<User[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');

  useEffect(() => {
    if (!cookies.userName) {
      navigate('/login');
    }
    getOneUserToUserId(cookies.userName).then((user) => {
      if (!user) {
        // somebody handle this
        console.log('No user found??');
        navigate('/login');
        return;
      }
      setUser(user);
      setUsersInSearch(user.following);
      if (!usersInGroup.includes(user)) addUserToGroup(user);
    });
  }, []);

  const fuseOptions = {
    keys: ['firstName', 'lastName', 'userName'],
  };
  const fuse = new Fuse<User>(usersInSearch, fuseOptions);

  function handleSearchChange(e: any) {
    e.preventDefault();
    const { value } = e.target;
    setSearchWord(value);
  }

  useEffect(() => {
    if (searchWord !== '') {
      // filter users
      const searchResults = fuse
        .search(searchWord)
        .map((result: Fuse.FuseResult<User>) => result.item);
      setUsersInSearch(searchResults);
    } else {
      // show all users the logged in user is following
      if (user && user.following) setUsersInSearch(user.following);
    }
  }, [searchWord, user]);

  function addUserToGroup(addedUser: User) {
    setUsersInGroup((usersInGroup) => [...usersInGroup, addedUser]);
  }

  function removeUserFromGroup(removeUser: User) {
    if (removeUser === user) {
      return;
    }
    const newGroup = usersInGroup.filter(
      (user) => user.userId !== removeUser.userId
    );
    setUsersInGroup(newGroup);
  }

  function onClickUser(clickedUser: User) {
    if (usersInGroup.includes(clickedUser)) {
      removeUserFromGroup(clickedUser);
    } else {
      addUserToGroup(clickedUser);
    }
  }

  function handleSubmit() {
    let dummyMovies: Movie[] = [];
    for (const id of [315162, 675353, 808]) {
      console.log(`getting ${id}`);
      getOneMovieToId(id).then((movie) => {
        console.log(`got ${movie}`);
        if (movie) dummyMovies.push(movie);
      });
    }
    // getMoviesToMovieNameSearchQuery('shrek').then((movies) => {
    //   console.log(`Res: ${movies}`);
    //   if (movies[0]) dummyMovies.push(movies[0]);
    // });
    console.log(`Recommending movies: ${dummyMovies}`);
    if (dummyMovies) {
      setRecommendedMovies(dummyMovies);
    } else {
      throw new Error('Error getting watch party movie recommendations');
    }
  }

  return (
    <Stack direction={'column'} spacing={1}>
      <Typography>
        Watch Party - Get movie recommendations for you and your friends
      </Typography>
      <Grid direction="row" container spacing={1}>
        <Grid container item sm={6}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Typography>Your Group</Typography>
              <WatchPartyGroupList
                users={usersInGroup}
                onClickUser={onClickUser}
              />
              <Typography>{`${usersInGroup.length} users selected`}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid container item sm={6}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Typography>Choose from your friends</Typography>
              <Paper
                component="form"
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 400,
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search User"
                  value={searchWord}
                  onChange={handleSearchChange}
                />
              </Paper>
              {user && user.following.length > 0 ? (
                usersInSearch.length != 0 ? (
                  <WatchPartyAddUsersList
                    users={usersInSearch}
                    usersInGroup={usersInGroup}
                    onClickUser={onClickUser}
                  />
                ) : (
                  <Typography>No results :&lt;</Typography>
                )
              ) : (
                <>
                  <Typography>
                    Follow other Movienators to select them here!
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Button variant="contained" size="large" onClick={handleSubmit}>
        Give me movies!
      </Button>
      {recommendedMovies && <MoviesList movies={recommendedMovies} />}
    </Stack>
  );
}
