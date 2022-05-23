import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webService: WebRequestService, private router: Router, private http: HttpClient) { }
  
  //Set Logging Status
  private loggedInStatus = false

  setLoggedIn(value: boolean) {
    this.loggedInStatus = value
  }

  //Student Login 
  login(email: string, password: string) {
    return this.webService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // the auth tokens will be in the header of this response
        this.setSession(res.body._id,res.body.name, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
        this.setLoggedIn(true)
        console.log("LOGGED IN!");
      })
    )
  }

  

  //Check if student is logged in 
  isLoggedIn() {
    return this.loggedInStatus
  }

  //Create a new student 
  signup(name: string, surname: string, email: string, password: string) {
    return this.webService.signup(name, surname, email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // the auth tokens will be in the header of this response
        this.setSession(res.body._id,res.body.name, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
        console.log("Successfully signed up and now logged in!");
      })
    )
  }


//Logout from the page
  logout() {
    this.removeSession();
    this.router.navigate(['/login']);
    this.setLoggedIn(false)
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  getStudentId() {
    return localStorage.getItem('student-id');
  }
  getStudentName() {
    return localStorage.getItem('student-name');
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken)
  }
  
  private setSession(userId: string, userName: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('student-id', userId);
    localStorage.setItem('student-name', userName);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  private removeSession() {
    localStorage.removeItem('student-id');
    localStorage.removeItem('student-name');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  getNewAccessToken() {
    return this.http.get(`${this.webService.ROOT_URL}/student/me/access-token`, {
      headers: {
        'x-refresh-token': this.getRefreshToken(),
        '_id': this.getStudentId(),
        'name': this.getStudentName()
      },
      observe: 'response'
    }).pipe(
      tap((res: HttpResponse<any>) => {
        this.setAccessToken(res.headers.get('x-access-token'));
      })
    )
  }
}