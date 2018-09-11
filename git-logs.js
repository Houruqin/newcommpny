const argv = require('yargs').argv;
const { exec } = require('child_process');

let date = new Date();
date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

exec(`git log --author ${argv.u || 'sonamu'} --since="${date}"`, (err, stdout, stderr) => {
  if (err) {
    return console.log(err);
  }

  let logs = stdout.split('\n');
  console.log(logs.filter((_, i) => i > 0 && i < logs.length && logs[i - 1] === logs[i + 1]).map(v => v.trim()).join('\n'))
});