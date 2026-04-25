/**
 * PayU Payment Gateway Integration
 * Documentation: https://devguide.payu.in/
 */

// PayU Configuration
const PAYU_CONFIG = {
  // Test credentials - Replace with production credentials
  merchantKey: process.env.REACT_APP_PAYU_MERCHANT_KEY || 'YOUR_MERCHANT_KEY',
  merchantSalt: process.env.REACT_APP_PAYU_MERCHANT_SALT || 'YOUR_MERCHANT_SALT',
  
  // PayU URLs
  testUrl: 'https://test.payu.in/_payment',
  productionUrl: 'https://secure.payu.in/_payment',
  
  // Use test URL for development
  isProduction: process.env.REACT_APP_PAYU_ENV === 'production',
};

/**
 * Generate hash for PayU payment
 * Hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 */
async function generatePayUHash(params) {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    salt
  } = params;

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  
  // In production, generate hash on backend for security
  // For now, using frontend (NOT RECOMMENDED for production)
  const hash = await sha512(hashString);
  return hash;
}

/**
 * SHA512 hash function
 */
async function sha512(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate unique transaction ID
 */
function generateTxnId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `DEVA_${timestamp}_${random}`;
}

/**
 * Initiate PayU payment
 */
export async function initiatePayUPayment(planDetails, userDetails) {
  try {
    const txnid = generateTxnId();
    const amount = planDetails.price.toFixed(2);
    
    // Payment parameters
    const paymentParams = {
      key: PAYU_CONFIG.merchantKey,
      txnid: txnid,
      amount: amount,
      productinfo: `DEVAsquare Pro - ${planDetails.plan} Plan`,
      firstname: userDetails.name || 'User',
      email: userDetails.email,
      phone: userDetails.phone || '9999999999',
      surl: `${window.location.origin}/payment/success`, // Success URL
      furl: `${window.location.origin}/payment/failure`, // Failure URL
      salt: PAYU_CONFIG.merchantSalt,
    };

    // Generate hash (In production, do this on backend)
    const hash = await generatePayUHash(paymentParams);

    // Create payment form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = PAYU_CONFIG.isProduction ? PAYU_CONFIG.productionUrl : PAYU_CONFIG.testUrl;

    // Add form fields
    const fields = {
      key: paymentParams.key,
      txnid: paymentParams.txnid,
      amount: paymentParams.amount,
      productinfo: paymentParams.productinfo,
      firstname: paymentParams.firstname,
      email: paymentParams.email,
      phone: paymentParams.phone,
      surl: paymentParams.surl,
      furl: paymentParams.furl,
      hash: hash,
    };

    Object.keys(fields).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    });

    // Store transaction details in localStorage
    localStorage.setItem('payuTransaction', JSON.stringify({
      txnid: txnid,
      amount: amount,
      plan: planDetails.plan,
      timestamp: Date.now()
    }));

    // Submit form
    document.body.appendChild(form);
    form.submit();

    return {
      success: true,
      txnid: txnid
    };
  } catch (error) {
    console.error('PayU payment initiation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify payment response (call this on success/failure page)
 */
export async function verifyPayUPayment(responseParams) {
  try {
    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      key
    } = responseParams;

    // In production, verify hash on backend
    // Hash formula for response: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const reverseHashString = `${PAYU_CONFIG.merchantSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = await sha512(reverseHashString);

    if (calculatedHash !== hash) {
      return {
        success: false,
        error: 'Hash verification failed'
      };
    }

    // Get stored transaction
    const storedTxn = JSON.parse(localStorage.getItem('payuTransaction') || '{}');

    if (storedTxn.txnid !== txnid) {
      return {
        success: false,
        error: 'Transaction ID mismatch'
      };
    }

    // Clear stored transaction
    localStorage.removeItem('payuTransaction');

    return {
      success: status === 'success',
      txnid: txnid,
      amount: amount,
      status: status
    };
  } catch (error) {
    console.error('PayU verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get PayU payment status
 */
export async function getPaymentStatus(txnid) {
  try {
    // In production, call backend API to check status
    const storedTxn = JSON.parse(localStorage.getItem('payuTransaction') || '{}');
    
    if (storedTxn.txnid === txnid) {
      return {
        status: 'pending',
        txnid: txnid
      };
    }

    return {
      status: 'not_found',
      txnid: txnid
    };
  } catch (error) {
    console.error('Get payment status error:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}

export default {
  initiatePayUPayment,
  verifyPayUPayment,
  getPaymentStatus
};
