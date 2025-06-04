class ApiResponse<T> {
  status: number;
  data: T | null;
  message: string;

  constructor(status: number, data: T | null, message: string) {
      this.status = status;
      this.data = data;
      this.message = message;
  }
}

export default ApiResponse;