import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ClientIdService {
  private clientId: string | null = null;
  private readonly CLIENT_ID_KEY = 'client_id';

  /**
   * Get the client ID, generating and storing it if it doesn't exist
   */
  async getClientId(): Promise<string> {
    if (this.clientId) {
      return this.clientId;
    }

    // Try to get from storage
    const { value } = await Preferences.get({ key: this.CLIENT_ID_KEY });

    if (value) {
      this.clientId = value;
      return value;
    }

    // Generate new client ID
    const newClientId = uuidv4();
    await Preferences.set({
      key: this.CLIENT_ID_KEY,
      value: newClientId,
    });

    this.clientId = newClientId;
    return newClientId;
  }

  /**
   * Clear the client ID (useful for testing or logout)
   */
  async clearClientId(): Promise<void> {
    await Preferences.remove({ key: this.CLIENT_ID_KEY });
    this.clientId = null;
  }
}
