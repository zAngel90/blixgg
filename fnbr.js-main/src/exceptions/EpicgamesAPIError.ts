import type { AxiosRequestConfig } from 'axios';
import type { EpicgamesAPIErrorData } from '../../resources/httpResponses';

/**
 * Represents an HTTP error from the Epicgames API
 */
class EpicgamesAPIError extends Error {
  /**
   * The HTTP method
   */
  public method: string;

  /**
   * The URL of the requested API endpoint
   */
  public url: string;

  /**
   * The Epicgames error code (Starts with "errors.com.epicgames")
   */
  public code: string;

  /**
   * The Epicgames numeric error code (defaults to null)
   */
  public numericCode: number | null;

  /**
   * The HTTP status code
   */
  public httpStatus: number;

  /**
   * The request data sent by the client
   */
  public requestData?: any;

  /**
   * The variables contained in {@link EpicgamesAPIError#message}
   */
  public messageVars: string[];

  /**
   * @param error The raw Epicgames API error data
   * @param request The client's request
   * @param status The response's HTTP status
   */
  constructor(error: EpicgamesAPIErrorData, request: AxiosRequestConfig, status: number) {
    super();
    this.name = 'EpicgamesAPIError';
    this.message = error.errorMessage;

    this.method = request.method?.toUpperCase() || 'GET';
    this.url = request.url || '';
    this.code = error.errorCode;
    this.numericCode = typeof error.numericErrorCode === 'number' ? error.numericErrorCode : null;
    this.messageVars = error.messageVars || [];
    this.httpStatus = status;
    this.requestData = request.data;
  }
}

export default EpicgamesAPIError;
