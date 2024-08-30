export class AppConstants {
  static AI_HORDE_ANON_KEY = '0000000000'

  static AI_HORDE_PROD_URL =
    process.env.NEXT_HORDE_API_HOST || 'https://aihorde.net'

  static CIVITAI_API_TIMEOUT_MS = 15000

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

  static MAX_LORA_SIZE_MB = 220

  static MAX_LORAS = 5

  /**
   * Speed of the typewriter effect in milliseconds
   */
  static TYPING_SPEED_MS = 25;
}
