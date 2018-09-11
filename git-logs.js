const argv = require('yargs').argv;
const { exec } = require('child_process');

let date = new Date();
date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

exec(`git log --oneline --author ${argv.u || 'sonamu'} --since="${date}"`, (err, stdout, stderr) => {
  if (err) {
    return console.log(err);
  }
  console.log(stdout.replace(/^\w{7} /mg, ''))
});