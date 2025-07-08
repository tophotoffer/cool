// Function to get the value of a query parameter by name
function cc_getQueryParam(name) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(name);
}

// Function to set a cookie with a given name, value, and expiration in days
function cc_setCookie(name, value, days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
}

function cc_getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function cc_storeGetParams() {
    // Array of values to store in cookies
    const valuesToStore = [
        'gclid',
        'wbraid',
        'gbraid',
        'tracking_id',
        'cid',
        'c3',
        'tabId', // Taboola,
        'pp_sandbox',
        'network-aff', // DFO Affiliate (Voluum)
    ];

    // Iterate over the array and store each value in a cookie if present in the URL
    valuesToStore.forEach(valueName => {
        const value = cc_getQueryParam(valueName);
        if (value) {
            // Store the value in a cookie that expires in 30 days (you can adjust the expiration as needed)
            cc_setCookie('cc_param_' + valueName, value, 30);
        }
    });
}

function cc_fireWebhookToStape(purchaseEvent) {
    const googleClickIds = [
        'gclid',
        'wbraid',
        'gbraid'
    ];

    googleClickIds.forEach((value) => {
        const cookieName = 'cc_param_' + value;
        const cookieValue = cc_getCookie(cookieName);
        if (cookieValue) {
            const data = {
                [value]: cookieValue,
                event_name: 'server_conversion',
                order: purchaseEvent.ecommerce
            }

            const endPoint = '/wp-json/checkout/v1/order/post-conversion'

            fetch(endPoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    cc_setCookie(cookieName, null, 0)
                    // console.log('Google Event server_conversion sent successfully:', data);
                })
                .catch(error => {
                    console.error('Error sending Google IDs:', error);
                })
                .finally(() => {
                    return true;
                });
        }
    })
}

window.addEventListener('load', cc_storeGetParams);