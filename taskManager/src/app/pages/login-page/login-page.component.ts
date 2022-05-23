import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  
  email!: string;
  password!: string;
  formData!: FormGroup;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.formData = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  doLogin(data: any) {
    //Valide input 
    this.email = data.email;
    this.password = data.password;

    //Only dsiplay for testing
    console.log('Login page: ' + this.email);
    console.log('Login page: ' + this.password);

    //Validate Loigin
    this.authService.login(this.email, this.password).subscribe((data) => {
   
      if (data){
        this.router.navigate(['/tasks'])
        this.authService.setLoggedIn(true)
      } 
      else{
        this.formData.setErrors({ unauthenticated: true });
      } 
     
    });
  }

}
