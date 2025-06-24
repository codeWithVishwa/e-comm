// razorpayUtils.js
export const loadRazorpay = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay object not available after script load'));
      }
      resolve();
    };
    script.onerror = (err) => {
      reject(new Error('Failed to load Razorpay SDK'));
    };
    document.body.appendChild(script);
  });
};

export const displayRazorpay = (options) => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay not initialized');
      }

      const rzp = new window.Razorpay({
        ...options, // 👈 use caller's handler
        modal: {
          ondismiss: () => {
            reject(new Error('Payment closed by user'));
          }
        }
      });

      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response);
        reject(new Error(response.error.description || 'Payment failed'));
      });

      rzp.open();
    } catch (error) {
      reject(error);
    }
  });
};
