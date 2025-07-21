import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css';

const vulnerabilities = [
  {
    id: 'lodash-template-injection',
    name: 'Lodash Template Injection',
    package: 'lodash@4.17.15',
    description: "Lodash's _.template() method can be used to execute arbitrary code when given untrusted input.",
    exploit: 'Use the /api/template endpoint with ?tpl=<%= require("child_process").execSync("ls") %> to demonstrate server-side code execution.'
  },
  {
    id: 'prototype-pollution',
    name: 'Prototype Pollution',
    package: 'minimist@1.2.5',
    description: 'Allows manipulation of JavaScript object prototypes via malicious keys like __proto__. This can lead to unexpected behavior or security bypasses.',
    exploit: 'Access /api/parse?input[]=--__proto__.isAdmin&input[]=true and observe that all objects may have isAdmin=true.'
  },
  {
    id: 'stored-xss',
    name: 'Stored Cross-Site Scripting (XSS)',
    package: 'react-draft-wysiwyg@1.14.5',
    description: 'Allows javascript: links in editor input that can lead to stored XSS when combined with dangerouslySetInnerHTML.',
    exploit: 'Use the WYSIWYG editor to insert a link like javascript:alert(1) and render it back in the DOM.'
  },
  {
    id: 'ssrf',
    name: 'Server-Side Request Forgery (SSRF)',
    package: 'axios@0.21.0',
    description: 'Axios can be tricked into following redirects to internal IPs or services, potentially leaking data or access.',
    exploit: 'Send a request to /api/fetch?url=http://malicious.site/redirect-to-internal and observe the server fetch unintended content.'
  },
  {
    id: 'open-redirect',
    name: 'Open Redirect',
    package: 'express@4.18.1',
    description: 'Express redirect logic can be misused to redirect users to malicious domains.',
    exploit: 'Try /api/redirect?url=http://evil.com@trusted.com and observe redirection to an unexpected site.'
  }
];

function VulnDetail({ vuln }) {
  return (
    <div classname="vuln-card"v>
      <h2>{vuln.name}</h2>
      <p><strong>Package:</strong> {vuln.package}</p>
      <p><strong>Description:</strong> {vuln.description}</p>
      <p><strong>How to Exploit:</strong> {vuln.exploit}</p>
      <p><Link to="/">← Back to list</Link></p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="container" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Vulnerable Web App</h1>
        <p>This frontend demonstrates known vulnerabilities intentionally included in the runtime-sca application for educational purposes.</p>
        <Routes>
          <Route
            path="/"
            element={
              <ul>
                {vulnerabilities.map((vuln) => (
                  <li key={vuln.id} style={{ marginBottom: '1rem' }}>
                    <Link to={`/vuln/${vuln.id}`}>
                      <strong>{vuln.name}</strong> — <em>{vuln.package}</em>
                    </Link>
                  </li>
                ))}
              </ul>
            }
          />
          {vulnerabilities.map((vuln) => (
            <Route
              key={vuln.id}
              path={`/vuln/${vuln.id}`}
              element={<VulnDetail vuln={vuln} />}
            />
          ))}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
