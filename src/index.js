import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import PWAPrompt from 'react-ios-pwa-prompt';
import '@fontsource/roboto';
import ErrorHandler from './components/ErrorHandler';


ReactDOM.render(
  <React.StrictMode>
    <ErrorHandler>
      <App />
    </ErrorHandler>
    <PWAPrompt
      copyBody="Add Locus-Plus to your Home Screen and you will be able to use it at any time. This means you will always be able to read out your location, even if you have no Internet connectivity"
      permanentlyHideOnDismiss="false"
    />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
serviceWorkerRegistration.register();