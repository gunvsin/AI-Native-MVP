// client/lib/network-interceptor.js

// This flag will be controlled by a UI toggle later
window.isNetworkModeActive = false;

function getCurlCommand(url, options) {
  let curl = `curl '${url}'`;

  if (options.method) {
    curl += ` -X ${options.method}`;
  }

  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      curl += ` -H '${key}: ${value.replace(/'/g, "'\''")}'`;
    }
  }

  if (options.body) {
    let bodyData = options.body;
    if (typeof bodyData === 'object') {
      try {
        bodyData = JSON.stringify(bodyData);
      } catch (e) {
        bodyData = '[Non-JSON Body]';
      }
    }
    // Escape single quotes in body for curl
    curl += ` --data '${bodyData.replace(/'/g, "'\''")}'`;
  }
  
  return curl;
}


export function initializeNetworkInterceptor() {
  if (typeof window === 'undefined') {
    return;
  }

  const originalFetch = window.fetch;

  if (originalFetch.isPatchedByNetworkInterceptor) {
    // Avoid patching more than once
    return;
  }

  window.fetch = async (...args) => {
    if (!window.isNetworkModeActive) {
      return originalFetch(...args);
    }

    const [url, options = {}] = args;

    console.groupCollapsed(`[Network] ${options.method || 'GET'} ${url}`);
    
    console.log('Request Options:', options);
    
    const curlCommand = getCurlCommand(url, options);
    console.log('cURL command:', curlCommand);
    
    console.groupEnd();
    
    return originalFetch(...args);
  };

  window.fetch.isPatchedByNetworkInterceptor = true;
}
