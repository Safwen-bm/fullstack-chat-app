export const getErrorMessage = (error) => {
  if (error?.response) {
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      "Something went wrong. Please try again."
    );
  }
  return "Cannot reach the server. Check your connection and try again.";
};