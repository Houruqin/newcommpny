const { exec } = require('child_process');

let date = new Date();
date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

exec(`git log --author sonamu --since="${date}" | sed 's/[a-zA-Z0-9[:punct:]]//g'`, (err, stdout, stderr) => {
  if (err) {
    return console.log(err);
  }
  console.log(stdout.split('\n').filter(v => v.trim()).map(v => v.trim()).join('\n'));
});