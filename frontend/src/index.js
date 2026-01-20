import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { matchRoutes, createRoutesFromChildren, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { initializeFaro, createReactRouterV6DataOptions, ReactIntegration, getWebInstrumentations } from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// Render the React app first, then initialize Faro asynchronously
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Initialize Faro with the collector URL from environment (async, won't block rendering)
setTimeout(() => {
  const faroCollectorUrl = process.env.REACT_APP_FARO_COLLECTOR_URL || 'https://faro-collector-prod-us-west-0.grafana.net/collect/2a7029471e7f21424646945f2e7275f1';
  const faroApiKey = process.env.REACT_APP_FARO_API_KEY;

  console.log('🚀 Initializing Faro with URL:', faroCollectorUrl);

  try {
    const faro = initializeFaro({
      url: faroCollectorUrl,
      app: {
        name: 'POV-SIM_2_Folly_demo',
        version: '1.0.0',
        environment: process.env.REACT_APP_ENV || 'production'
      },
      // Don't limit session duration - let it run indefinitely
      sessionTracking: {
        enabled: true,
        sampleRate: 1.0, // Capture 100% of sessions
        sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
      },
      instrumentations: [
        // Mandatory, omits default instrumentations otherwise.
        ...getWebInstrumentations({
          captureConsole: true,
          captureConsoleDisabledLevels: [], // Capture all console levels
        }),

        // Tracing package to get end-to-end visibility for HTTP requests.
        new TracingInstrumentation(),

        // React integration for React applications.
        new ReactIntegration({
          router: createReactRouterV6DataOptions({
            createRoutesFromChildren,
            matchRoutes,
            Routes,
            useLocation,
            useNavigationType,
          }),
        }),
      ],
    });
    
    // Store Faro instance globally for use in components
    window.faro = faro;
    
    // Add custom metadata/context
    faro.api.setSession({
      attributes: {
        deployment: 'pov-sim-2',
        component: 'frontend',
      }
    });
    
    console.log('✅ Faro initialized successfully');
    console.log('Collector URL:', faroCollectorUrl);
    console.log('Airlines API:', process.env.REACT_APP_AIRLINES_API_URL || 'not set');
    console.log('Flights API:', process.env.REACT_APP_FLIGHTS_API_URL || 'not set');
    
    // Monitor Faro state
    window.checkFaroHealth = setInterval(() => {
      console.log('[Faro Health] Still active at', new Date().toLocaleTimeString());
    }, 60000); // Check every minute
    
  } catch (error) {
    console.error('❌ Failed to initialize Faro:', error);
    console.error('Stack:', error.stack);
  }
}, 0);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
