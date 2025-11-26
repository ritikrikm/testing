import "./toast.css";
export const toast = {
  success(message) {
    return (
      <div className="success-container">
        <h2>Your {message} is done</h2>
      </div>
    );
  },
  fail(message) {
    return (
      <div className="fail-container">
        <h2>Your {message} is failed</h2>
      </div>
    );
  },
};
