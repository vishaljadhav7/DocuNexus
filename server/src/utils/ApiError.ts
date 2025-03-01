class ApiError extends Error {
    constructor(
      public statusCode: number,
      public message: string,
      public success: boolean = false 
    ) {
      super(message);
      this.name = 'ApiError'; 
      Object.setPrototypeOf(this, ApiError.prototype);
    }
  }

export default ApiError;