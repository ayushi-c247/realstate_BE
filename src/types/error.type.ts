export interface ICustomError extends Error {
  field: any;
  code: string;
  sendErrMsgToCaller: boolean;
  statusCode: number;
  message: string;
}
