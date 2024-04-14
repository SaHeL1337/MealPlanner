const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

var requireLoginWithRole = require('./requireLoginWithRole');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

//------------------------------------------------------------------------------
const authenticationService = createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true, onProxyReq: (proxyReq, req, res) => { proxyReq.setHeader('auth-loggedInUserID', req.loggedInUserID ? req.loggedInUserID : null); } });
const mealService = createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true, onProxyReq: (proxyReq, req, res) => { proxyReq.setHeader('auth-loggedInUserID', req.loggedInUserID ? req.loggedInUserID : null); } });

//------------------------------------------------------------------------------
app.use(cors());

app.post('/api/users/authenticate', authenticationService);
app.post('/api/users/register', authenticationService);
app.post('/api/users/logout', requireLoginWithRole.user, authenticationService);
app.put('/api/users/:id', requireLoginWithRole.admin, authenticationService);
app.get('/api/users/:id', requireLoginWithRole.admin, authenticationService);
app.delete('/api/users/:id', requireLoginWithRole.admin, authenticationService);
app.get('/api/users', requireLoginWithRole.admin, authenticationService);


app.post('/api/refreshtoken', authenticationService);
app.get('/api/refreshtokens', requireLoginWithRole.admin, authenticationService);
app.delete('/api/refreshtokens/:id', requireLoginWithRole.admin, authenticationService);

app.get('/api/roles/:id', requireLoginWithRole.admin, authenticationService);
app.put('/api/roles/:id', requireLoginWithRole.admin, authenticationService);
app.delete('/api/roles/:id', requireLoginWithRole.admin, authenticationService);
app.get('/api/roles', requireLoginWithRole.admin, authenticationService);


app.get('/api/ingredients/:id', requireLoginWithRole.user, mealService);
app.put('/api/ingredients/:id', requireLoginWithRole.admin, mealService);
app.delete('/api/ingredients/:id', requireLoginWithRole.admin, mealService);
app.get('/api/ingredients', requireLoginWithRole.user, mealService);


app.get('/api/units', requireLoginWithRole.user, mealService);

app.get('/api/meals/:id', requireLoginWithRole.user, mealService);
app.delete('/api/meals/:id', requireLoginWithRole.admin, mealService);
app.put('/api/meals/:id', requireLoginWithRole.user, mealService);
app.get('/api/meals', requireLoginWithRole.user, mealService);

app.delete('/api/user/meal/preferences/:id', requireLoginWithRole.user, mealService);
app.put('/api/user/meal/preferences/:id', requireLoginWithRole.user, mealService);
app.get('/api/user/meal/preferences', requireLoginWithRole.user, mealService);

//fallback, everything that is not explicitly whitelisted will not be allowed
app.get('/', requireLoginWithRole.admin, authenticationService);

app.listen(3003, () => {
    console.log('Gateway service started on port 3003');
});
