import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onSignupButtonClicked(name: string, surname: string, email: string, password: string) {
    this.authService.signup(name, surname, email, password).subscribe((res: HttpResponse<any>) => {
      console.log(res);
      this.router.navigate(['/tasks']);
    });
  }

}
