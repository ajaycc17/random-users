import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { db } from "./db";
import logo from "./images/dumbbel.svg";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
    Container,
    Stack,
    Typography,
    Chip,
    Box,
    Grid,
    Button,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    CircularProgress,
} from "@mui/material";
import { Refresh, AccountCircle } from "@mui/icons-material";

interface userSchema {
    id: string;
    name: string;
    image: string;
}

function App() {
    const [users, setUsers] = useState([]) as any[];
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // purely optional. This is just to visualize spinner
    const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    // load data from api and store in indexeddb (only when indexeddb is empty)
    const loadData = useCallback(async () => {
        if ((await db.users.count()) === 0) {
            const res = await axios.get(
                `https://randomuser.me/api/?results=50`
            );
            // extract only the data we need i.e. id, name and image
            const usersArr = [] as any[];
            res.data.results.forEach(async (user: any) => {
                usersArr.push({
                    id: user.login.uuid,
                    name:
                        user.name.title +
                        " " +
                        user.name.first +
                        " " +
                        user.name.last,
                    image: user.picture.large,
                });
            });

            // store data in indexeddb
            await db.users.bulkAdd(usersArr);
            // get data from indexeddb
            const users = await db.users.toArray();
            setUsers(users);
            setUserCount(users.length);
            // just to visualize spinner
            await delay(1000);
            // set loading to false
            setLoading(false);
        } else {
            // get data from indexeddb
            const users = await db.users.toArray();
            setUsers(users);
            setUserCount(users.length);
            // just to visualize spinner
            await delay(1000);
            // set loading to false
            setLoading(false);
        }
    }, []);

    // only run this effect once
    useEffect(() => {
        setLoading(true);
        loadData();
    }, [loadData]);

    // delete user from indexeddb and update interface
    const deleteUser = async (userId: string) => {
        await db.users.delete(userId);
        const newUsers = users.filter((user: any) => user.id !== userId);
        setUsers(newUsers);
        setUserCount(newUsers.length);
    };

    // delete all users from indexeddb and fetch fresh 50 users from api
    const handleRefresh = async () => {
        await db.users.clear();
        setLoading(true);
        loadData();
    };

    // the spinner will be shown until data is loaded
    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* navbar */}
            <Box
                sx={{
                    backgroundColor: "#eee",
                    position: "sticky",
                    top: "0",
                    zIndex: "10",
                }}
            >
                <Container>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        py={1}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <img
                                src={logo}
                                className="App-logo"
                                alt="logo"
                                width={40}
                                height={40}
                            />
                            <Typography variant="subtitle1" component="h2">
                                Users
                            </Typography>
                        </Stack>
                        <Stack spacing={2} direction="row" alignItems="center">
                            <Chip
                                icon={<AccountCircle />}
                                label={`${userCount} Users`}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<Refresh />}
                                onClick={handleRefresh}
                            >
                                Refresh
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>
            {/* body section */}
            <main>
                <Container sx={{ marginTop: "1rem", marginBottom: "1rem" }}>
                    <Grid
                        container
                        spacing={{ xs: 2, md: 3 }}
                        columns={{ xs: 4, sm: 8, md: 12 }}
                    >
                        {users.map((user: userSchema) => (
                            <Grid item xs={2} key={user.id}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={user.image}
                                        alt={user.name}
                                    />
                                    <CardContent>
                                        <Typography
                                            gutterBottom
                                            variant="subtitle1"
                                            component="div"
                                        >
                                            {user.name}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={() => deleteUser(user.id)}
                                        >
                                            Delete
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </main>
        </Box>
    );
}

export default App;
