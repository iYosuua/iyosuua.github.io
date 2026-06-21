const fs = require('fs');
const s = fs.readFileSync('_site/index.html', 'utf8');
const ids = ['window-about','window-experience','window-skills','window-projects','window-contact','window-mycomputer','window-recyclebin'];
for (const id of ids) console.log(id.padEnd(20), s.includes('id="'+id+'"') ? 'OK' : 'MISSING');
console.log('desktop-icon count:', (s.match(/desktop-icon/g)||[]).length);
console.log('job entries:', (s.match(/class="job"/g)||[]).length);
console.log('skills fieldsets:', (s.match(/<fieldset>/g)||[]).length);
console.log('contact rows:', (s.match(/contact-row/g)||[]).length);
console.log('total size:', s.length, 'bytes');
