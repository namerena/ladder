import Express from 'express';
import {roundRun} from './lib/Runner';
import {Server} from './lib/Server';
import {FileStorage} from './lib/Storage';
import Cors from 'cors';
import bodyParser from 'body-parser';
import {getUTC8Str, TEAMS, FiveMinutes} from './lib/util';

async function main() {
  let mainStorage = new FileStorage('./storage');
  let logStorage = new FileStorage('./log');
  let server = new Server(mainStorage, logStorage);

  // let baseT = Math.random()* 1588126518602;
  // for (let i = 0; i < 1; ++i) {
  //   let ts = baseT + i * FiveMinutes;
  //   let tstr = getUTC8Str(ts);
  //   await roundRun(server.games['1a'], ts, tstr);
  //   console.log(i);
  // }
  // server.sortGame('1');
  // server.saveScores('1');
  // return;

  server.updateIndexPage(`${getUTC8Str(new Date().getTime(), 1)} ： 服务器重新启动`);
  server.start();

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
