import Express from 'express';
import {roundRun} from './lib/Runner';
import {Server} from './lib/Server';
import {FileStorage} from './lib/Storage';
import Cors from 'cors';

async function main() {
  let mainStorage = new FileStorage('./storage');
  let logStorage = new FileStorage('./log');
  let server = new Server(mainStorage, logStorage);

  server.start();

  let app = Express();
  app.use(Cors());

  // first 100 of one team size
  app.get('/index', (req, res) => {
    res.send('hello');
  });

  // update one user
  app.get('/update', (req, res) => {
    res.send('hello');
  });

  // get info of one user, with neighbor members at each size
  app.get('/get', (req, res) => {
    res.send('hello');
  });

  // get history of one user, one team size
  app.get('/history', (req, res) => {
    res.send('hello');
  });

  app.listen(80);

  console.log('listening on 80');
}

main();
