import Express from 'express';
import {roundRun} from './lib/Runner';
import {Server, TEAMS} from './lib/Server';
import {FileStorage} from './lib/Storage';
import Cors from 'cors';
import bodyParser from 'body-parser';

async function main() {
  let mainStorage = new FileStorage('./storage');
  let logStorage = new FileStorage('./log');
  let server = new Server(mainStorage, logStorage);
  server.updateIndexPage('');
  server.start(0);

  let app = Express();
  app.use(Cors());
  app.use(bodyParser.json());

  // first 100 of one team size
  app.get('/index', (req, res) => {
    if (server.indexPage) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Content-Length': server.indexPage.length,
      });
      res.end(server.indexPage);
    } else {
      res.send('');
    }
  });

  // update one user
  app.post('/update', (req, res) => {
    res.send(server.updateUser(req.body));
  });

  // get info of one user, with neighbor members at each size
  app.get('/get', (req, res) => {
    if (typeof req.query.clan === 'string') {
      res.send(server.getUser(req.query.clan));
    } else {
      res.end();
    }
  });

  // get history of one user, one team size
  app.get('/history', (req, res) => {
    if (typeof req.query.clan === 'string' && TEAMS.includes(req.query.team as any)) {
      res.send(server.getUserHistory(req.query.clan, req.query.team as any));
    } else {
      res.end();
    }
  });

  app.listen(80);

  console.log('listening on 80');
}

main();
