import React, { useEffect, useState } from 'react';
import '../styles/PaymentPages.css';

const PaymentFailure = () => {
  const [txnDetails, setTxnDetails] = useState(null);

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    setTxnDetails({
      txnid: urlParams.get('txnid'),
      status: urlParams.get('status'),
      error: urlParams.get('error_Message') || 'Payment was not completed'
    });
  }, []);

  return (
    <div className="payment-page">
      <div className="payment-card failure">
        <div className="icon-large failure-icon">✕</div>
        <h2>Payment Failed</h2>
        <p>Unfortunately, your payment could not be processed.</p>
        
        {txnDetails && (
          <div className="error-details">
            <p><strong>Transaction ID:</strong> {txnDetails.txnid}</p>
            <p><strong>Status:</strong> {txnDetails.status}</p>
            <p><strong>Reason:</strong> {txnDetails.error}</p>
          </div>
        )}

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => window.location.href = '/'}>
            Try Again
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </button>
        </div>

        <div className="help-section">
          <p>Need help? Contact our support team:</p>
          <a href="mailto:support@devasquare.com">support@devasquare.com</a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
