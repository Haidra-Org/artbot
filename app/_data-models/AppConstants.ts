export class AppConstants {
  static AI_HORDE_ANON_KEY = '0000000000'

  /**
   * Maximum number of simulatenous jobs that can be running on the Horde.
   * Should be lower for anon users. Logged in users should be able to increase this in settings app.
   */
  static MAX_CONCURRENT_JOBS = 10

  /**
   * Sets length of nanoid output used across entire web app.
   */
  static NANO_ID_LENGTH = 13

  static IMAGE_UPLOAD_TEMP_ID = '__TEMP_USER_IMG_UPLOAD__'

  /**
   * Maximum supported resolution for image requests to the AI Horde
   */
  static MAX_IMAGE_PIXELS = 4194304
}
