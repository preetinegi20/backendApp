const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("Async handler error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
  };
};
export { asyncHandler };
