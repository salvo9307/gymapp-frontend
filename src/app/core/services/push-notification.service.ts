import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private http = inject(HttpClient);
  private swPush = inject(SwPush);

  private readonly vapidPublicKey = 'BBWdKlkeKJYpw0jjQwv4tJ2WhlMJUM6OvRpijaoEn0LanD83uI5NM7eKJ3_7pQvQldbMMtntL2eBhJPDJo4O4UU';

  enableNotifications(): Promise<void> {
    if (!this.swPush.isEnabled) {
      return Promise.reject('Service worker non attivo. Fai build PWA per testare.');
    }

    return this.swPush.requestSubscription({
      serverPublicKey: this.vapidPublicKey
    }).then(subscription => {
      const raw: any = subscription.toJSON();

      return this.http.post(`${environment.apiUrl}/push-subscriptions`, {
        endpoint: raw.endpoint,
        p256dh: raw.keys.p256dh,
        auth: raw.keys.auth
      }).toPromise().then(() => undefined);
    });
  }
}