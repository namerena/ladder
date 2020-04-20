import Fs from 'fs';
import Path from 'path';

class JobIOTask {
  current?: 'write' | 'delete';
  next?: 'write' | 'delete';
  nextData: string;

  constructor(public loader: FileStorage, public name: string, public path: string) {}

  write(data: string) {
    if (this.next || this.current) {
      this.next = 'write';
      this.nextData = data;
    } else {
      this.current = 'write';
      Fs.writeFile(this.path, data, this.onDone);
    }
  }

  delete() {
    if (this.next) {
      if (this.next !== 'delete') {
        this.next = 'delete';
        this.nextData = null;
      }
    } else if (this.current) {
      if (this.current !== 'delete') {
        this.next = 'delete';
        this.nextData = null;
      }
    } else {
      this.current = 'delete';
      Fs.unlink(this.path, this.onDone);
    }
  }

  onDone = () => {
    if (this.next) {
      let {next, nextData} = this;
      this.next = null;
      this.nextData = null;
      this.current = null;
      switch (next) {
        case 'delete':
          this.delete();
          return;
        case 'write':
          this.write(nextData);
          return;
      }
    } else {
      this.loader.taskDone(this);
    }
  };
}

export class FileStorage {
  tasks: Map<string, JobIOTask> = new Map();

  getTask(name: string) {
    if (this.tasks.has(name)) {
      return this.tasks.get(name);
    } else {
      let task = new JobIOTask(this, name, Path.join(this.dir, `${name}.json`));
      this.tasks.set(name, task);
      return task;
    }
  }
  taskDone(task: JobIOTask) {
    if (this.tasks.get(task.name) === task) {
      this.tasks.delete(task.name);
    }
  }

  dir: string;
  constructor(dir: string) {
    this.dir = Path.resolve(dir);
  }

  deleteFile(name: string) {
    this.getTask(name).delete();
  }
  saveFile(name: string, str: string) {
    this.getTask(name).write(str);
  }
  init(): Map<string, string> {
    let result = new Map<string, string>();
    for (let file of Fs.readdirSync(this.dir)) {
      if (file.endsWith('.json')) {
        let name = file.substring(0, file.length - '.json'.length);
        try {
          result.set(name, Fs.readFileSync(Path.join(this.dir, `${name}.json`), 'utf8'));
        } catch (err) {
          // TODO Logger
        }
      }
    }
    return result;
  }
}
