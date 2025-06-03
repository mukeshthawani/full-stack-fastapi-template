import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"
import type { Message } from "./types.gen"

export class GoogleService {
  /** Save Google OAuth credentials */
  public static saveCredentials(
    credentials_json: string,
  ): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/google/credentials",
      body: credentials_json,
      mediaType: "application/json",
    })
  }

  /** Get Google Calendar events for the next hour */
  public static getEventsNextHour(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/google/events/next-hour",
    })
  }
}
