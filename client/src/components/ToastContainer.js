import React, { useState, useEffect } from "react";

const ToastContainer = ({ serverMassage }) => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (serverMassage) {
      setShowToast(true);
      const timeout = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [serverMassage]);

  return (
    <div className="container">
      {showToast && (
        <div id="serverError" className="position-fixed bottom-0 end-0 p-3">
          <div
            className="toast show"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <strong className="me-auto">Error</strong>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="toast"
                aria-label="Close"
              ></button>
            </div>
            <div className="toast-body">{serverMassage}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToastContainer;
