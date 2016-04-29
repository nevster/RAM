import * as express from 'express';
import * as path from 'path';
import * as loggerMorgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import * as cApi from '../../commons/RamAPI';
import * as api from './ram/ServerAPI';
import {logStream} from './logger';
// import {continueOnlyIfJWTisValid} from './security'
// Prepare mongoose for daily operations
import * as mongoose from 'mongoose';
mongoose.connect('mongodb://localhost/ram');

import {PartyController} from './controllers/party.controller';
import {RelationshipController} from './controllers/relationship.controller';
import {ResetController} from './controllers/reset.server.controller';

if (process.env.RAM_CONF === void 0 ||
process.env.RAM_CONF.trim().length === 0) {
    console.log('Missing RAM_CONF environment variable');
    process.exit(1);
}

/* tslint:disable:no-var-requires */ const conf: api.IRamConf = require(`${process.env.RAM_CONF}`);

 const server = express();

switch (conf.devMode) {
    case false:
        // todo: Log to file: https://github.com/expressjs/morgan
        server.use(loggerMorgan('prod', { stream: logStream }));
        break;
    default:
        server.use(loggerMorgan('dev', { stream: logStream }));
        break;
}

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(methodOverride());

// server.use(continueOnlyIfJWTisValid(conf.jwtSecretKey,true));

server.use(express.static(path.join(__dirname, conf.frontendDir)));

server.use('/api/reset',
    new ResetController().assignRoutes(express.Router()));
server.use('/api/1/party',
    new PartyController().assignRoutes(express.Router()));
server.use('/api/1/relationship',
    new RelationshipController().assignRoutes(express.Router()));

// catch 404 and forward to error handler
server.use((req: express.Request, res: express.Response) => {
    const err = new cApi.ErrorResponse(404, 'Not Found');
    res.send(err);
});

// server.use((ramResponse: cApi.IResponse, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     if (ramResponse.isError) {
//         res.send(ramResponse); // Todo: More specific error handling
//     } else {
//         res.send(ramResponse);
//     }
// });

server.listen(conf.httpPort);
console.log(`RAM Server running on port ${conf.httpPort}`);