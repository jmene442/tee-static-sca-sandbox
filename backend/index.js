process.env.DD_TRACE_DEBUG = 'true';
process.env.DD_LOGS_INJECTION = 'true';
process.env.DD_TRACE_STARTUP_LOGS = 'true';
process.env.DD_TRACE_TELEMETRY_ENABLED = 'true';

require('dd-trace').init({
  logInjection: true,
  runtimeMetrics: true
});

const bunyan = require('bunyan');
const logger = bunyan.createLogger({ name: 'static-sca', level: 'debug' });

const express = require('express');
const _ = require('lodash');
const minimist = require('minimist');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

// Here are the new vulnerabilities. You can recomment them using /**/ 

// Command Injection via child_process.exec
const { exec } = require('child_process');
// exploit via /api/exec?cmd=ls in the queryparams
app.get('/api/exec', (req, res) => {
  const cmd = req.query.cmd;
  if (!cmd) return res.status(400).send('Missing "cmd"');
  exec(cmd, (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr);
    res.send(stdout);
  });
});

//ReDoS via validator package
const validator = require('validator');
// exploit via /api/validate?email=aaaaaaaaaaaaaa!@example.com in queryparams
app.get('/api/validate', (req, res) => {
  const email = req.query.email;
  const isValid = validator.isEmail(email || '');
  res.send(`Is valid email: ${isValid}`);
});

//Insecure deserialization via node-serialize
const serialize = require('node-serialize');
//data={"exploit":"_$$ND_FUNC$$_function(){require('child_process').exec('ls')}"} 
app.get('/api/deserialize', (req, res) => {
  const payload = req.query.data;
  try {
    const obj = serialize.unserialize(payload);
    res.json(obj);
  } catch (e) {
    res.status(500).send('Failed to deserialize');
  }
});

//Directory Traversal via File Upload (express)

const fileUpload = require('express-fileupload');
app.use(fileUpload());
// Upload a file with a name like ../../etc/passwd.
app.post('/api/upload', (req, res) => {
  const file = req.files?.file;
  if (!file) return res.status(400).send('No file uploaded');
  file.mv(`uploads/${file.name}`, (err) => {
    if (err) return res.status(500).send(err.message);
    res.send('File uploaded');
  });
});

// Unsafe YAML Parsing
const yaml = require('js-yaml');
/*
exploit via:
  !!js/function >
  function() { require('child_process').exec('ls', console.log) }
*/
app.post('/api/yaml', express.text({ type: 'text/yaml' }), (req, res) => {
  try {
    const parsed = yaml.load(req.body);
    res.json(parsed);
  } catch {
    res.status(400).send('Invalid YAML');
  }
});

/*
<------------------------------------------------------------------------------------------------------------------------------->
*/

// Vulnerable routes
// OLD CODE - DO NOT UNCOMMENT
// this serves as example code to explain the previous behaviour from the original runtime sandbox.
/*
app.get('/api/template', (req, res) => {
  const tpl = req.query.tpl || 'Hello <%= name %>';
  try {
    const compiled = _.template(tpl);
    const output = compiled({ name: 'World' });
    res.send(`Output: ${output}`);
  } catch (err) {
    res.status(400).send('Template Error: ' + err.message);
  }
});

app.get('/api/redirect', (req, res) => {
  const target = req.query.url;
  if (!target) return res.send('No target url provided.');
  return res.redirect(target);
});

app.get('/api/parse', (req, res) => {
  const inputArgs = req.query.input || [];
  const parsed = minimist(inputArgs);
  res.json(parsed);
});

app.get('/api/fetch', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL is required');
  try {
    const response = await axios.get(url);
    res.type('text/plain').send(response.data);
  } catch (error) {
    res.status(500).send('Fetch error: ' + error.message);
  }
});
*/

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Listening on 0.0.0.0:${PORT}`);
});
