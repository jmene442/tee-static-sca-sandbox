process.env.DD_TRACE_DEBUG = 'true';
process.env.DD_LOGS_INJECTION = 'true';
process.env.DD_TRACE_STARTUP_LOGS = 'true';
process.env.DD_TRACE_TELEMETRY_ENABLED = 'true';

require('dd-trace').init({
  logInjection: true,
  runtimeMetrics: true
});

const bunyan = require('bunyan');
const logger = bunyan.createLogger({ name: 'runtime-sca', level: 'debug' });

const express = require('express');
const _ = require('lodash');
const minimist = require('minimist');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

// Vulnerable routes
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Listening on 0.0.0.0:${PORT}`);
});
