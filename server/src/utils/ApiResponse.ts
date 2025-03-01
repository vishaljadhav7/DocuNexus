class ApiResponse<T> {
    constructor(
      public statusCode: number,
      public data: T | null,
      public message: string = 'Success',
      public success: boolean = statusCode < 400
    ) {}
  }
  
  export default ApiResponse;