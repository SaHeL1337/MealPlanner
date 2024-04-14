const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

var requireLoginWithRole = require('./requireLoginWithRole');

const app = express();

const accessTokenSecret = 'somerandomaccesstoken';
const refreshTokenSecret = 'somerandomstringforrefreshtoken';

const roles = [
    {
        id  : 1,
        name: 'admin',
        createdAt: '1519129755973',
        isDeletable: false,
    }, {
        id  : 2,
        name: 'user',
        createdAt: '1519129725973',
        isDeletable: false,
    }, {
        id  : 3,
        name: 'test',
        createdAt: '1519129725923',
        isDeletable: true,
    }
]

const users = [
    {
        id  : 1,
        username: 'Martin',
        password: 'admin123',
        createdAt: '1519129755973',
        isDeletable: false,
        roles    : [roles.find(r => r.name === 'admin').id, roles.find(r => r.name === 'user').id]
    }, {
        id  : 2,
        username: 'Lena',
        password: 'user123',
        createdAt: '1519129725973',
        isDeletable: true,
        roles    : [roles.find(r => r.name === 'user').id]
    }
]

const refreshTokens = [];

//------------------------------------------------------------------------------


app.use(bodyParser.json());
app.use(cors());

app.post('/api/users/authenticate', (req, res) => {
    // read username and password from request body
    const { username, password } = req.body;

    // filter user from the users array by username and password
    const user = users.find(u => { return u.username === username && u.password === password });

    if (user) {
        // generate an access token
        const token = jwt.sign({ id: user.id, roles: user.roles }, accessTokenSecret, { expiresIn: '1000m' });
        const refreshToken = jwt.sign({ id: user.id, roles: user.roles }, refreshTokenSecret);

        //remove refreshtoken before adding a new one
        const oldRefreshToken = refreshTokens.find(r => { return r.id == user.id });
        var index = refreshTokens.indexOf(oldRefreshToken);
        if (~index) {
            refreshTokens.splice(index, 1);
        }
        refreshTokens.push({id: user.id, refreshToken: refreshToken});
        console.log(refreshTokens);
        res.json({
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            roles: user.roles,
            token,
            refreshToken
        });
    } else {
        return res.status(401).json({status:"Unauthorized"});
    }
});

app.get('/api/users', (req, res) => {
    res.send(users);
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => { return u.id == req.params.id });
    res.send(user);
});

app.put('/api/users/:id', (req, res) => {
    const { username, password, roles } = req.body;
    const user = users.find(u => { return u.id == req.params.id });
    var index = users.indexOf(user);
    var updatedUser = {};

    //update
    if (~index) {
        updatedUser.id = user.id;
        updatedUser.username = username ? username : user.username;
        updatedUser.password = password ? password : user.password;
        updatedUser.roles = roles ? roles : user.roles;
        updatedUser.createdAt = user.createdAt;
        updatedUser.isDeletable = user.isDeletable;
        users.splice(index, 1);
    }else{ //user does not exist so far
        updatedUser.id = users.length+1;
        updatedUser.username = username;
        updatedUser.password = password;
        updatedUser.roles = [2];
        updatedUser.createdAt = Date.now();
        updatedUser.isDeletable = true;
    }
    users.push(updatedUser);
    res.status(200).json({status:"ok"});
});

app.post('/api/users/register', (req, res) => {
    const { username, password } = req.body;
    let newUser = {};

    newUser.id = users.length+1;
    newUser.username = username;
    newUser.password = password;
    newUser.roles = [2];
    newUser.createdAt = Date.now();
    newUser.isDeletable = true;

    users.push(newUser);
    res.status(200).json({status:"ok"});
});

app.delete('/api/users/:id', (req, res) => {
    const user = users.find(u => { return u.id == req.params.id });
    if(!user.isDeletable){
      return res.sendStatus(401);
    }
    var index = users.indexOf(user);
    if (~index) {
        users.splice(index, 1);
    }
    res.status(200).json({status:"ok"})
});

app.post('/api/users/logout', (req, res) => {
  //TODO make people not logout other people
    if(!req.user){
      return res.status(200).json({status:"ok"}); //already logged out
    }
    const refreshToken = refreshTokens.find(r => { return r.id == req.user.id });
    var index = refreshTokens.indexOf(refreshToken);
    if (~index) {
        refreshTokens.splice(index, 1);
    }
    res.status(200).json({status:"ok"})
});

app.post('/api/refreshtoken', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.sendStatus(401);
    }

    const token = refreshTokens.find(r => { return r.refreshToken == refreshToken });

    if (!token) { //refreshtoken has been deleted in the meantime. require login
      return res.sendStatus(403);
    }

    const user = users.find(u => { return u.id === token.id });

    jwt.verify(refreshToken, refreshTokenSecret, (err, content) => {
        if (err) {
            return res.sendStatus(403);
        }
        const token = jwt.sign({ id: user.id, roles: user.roles }, accessTokenSecret, { expiresIn: '5m' });

        res.json({
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            roles: user.roles,
            token,
            refreshToken
        });
    });
});

app.get('/api/refreshtokens', (req, res) => {
    res.send(refreshTokens);
});

app.delete('/api/refreshtokens/:id', (req, res) => {
    const refreshToken = refreshTokens.find(r => { return r.id == req.params.id });
    var index = refreshTokens.indexOf(refreshToken);
    if (~index) {
        refreshTokens.splice(index, 1);
    }
    res.status(200).json({status:"ok"})
});

//------------------------------------------------------------------------------
//roles
app.get('/api/roles', (req, res) => {
    res.send(roles);
});

app.get('/api/roles/:id', (req, res) => {
    const role = roles.find(r => { return r.id == req.params.id });
    res.send(role);
});

app.put('/api/roles/:id', (req, res) => {
    const { name } = req.body;
    const role = roles.find(r => { return r.id == req.params.id });
    var index = roles.indexOf(role);
    updatedRole = {
      name: name,
    }

    //update
    if (~index) {
        updatedRole.id = index + 1;
        updatedRole.createdAt = role.createdAt;
        roles.splice(index, 1);
    }else{ //user does not exist so far
        updatedRole.id = roles.length+1;
        updatedRole.createdAt = Date.now();
    }
    roles.push(updatedRole);
    res.status(200).json({status:"ok"});
});

app.delete('/api/roles/:id', (req, res) => {
    const role = roles.find(r => { return r.id == req.params.id });
    if(!role.isDeletable){
      return res.sendStatus(401);
    }
    var index = roles.indexOf(role);
    if (~index) {
        roles.splice(index, 1);
    }
    res.status(200).json({status:"ok"})
});



app.listen(3000, () => {
    console.log('Authentication service started on port 3000');
});
