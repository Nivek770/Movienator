import { SingleUserProps } from '../../props/UserProps';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  InputBase,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import OwnProfileUsersLists from '../OwnProfileComponents/OwnProfileUsersLists';
import { User } from '../../types/User';
import { searchUsersByUserNameQuery } from '../../services/UserService';

export default function OwnProfileUserSearch() {
  const [searchWord, setSearchWord] = useState<string | undefined>();
  const [users, setUsers] = useState<User[]>([]);

  function handleChange(e: any) {
    e.preventDefault();
    const { value } = e.target;
    setSearchWord(value);
  }

  useEffect(() => {
    if (searchWord !== undefined) {
      searchUsersByUserNameQuery(searchWord).then((res) => {
        setUsers(res);
      });
    }
  }, [searchWord]);

  return (
    <Card sx={{ backgroundColor: grey.A200, minHeight: 200, maxHeight: 200 }}>
      <CardContent>
        <Stack direction={'row'} spacing={1} alignItems={'stretch'}>
          <Stack direction={'column'} spacing={1}>
            <Typography variant="h5">Get to know other Movienators!</Typography>
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
                onChange={handleChange}
              />
            </Paper>
          </Stack>
          <OwnProfileUsersLists title={''} users={users} />
        </Stack>
      </CardContent>
    </Card>
  );
}
