import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewTasksComponent } from './pages/new-tasks/new-tasks.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { EditTasksComponent } from './pages/edit-tasks/edit-tasks.component';
import { EditTaskComponent } from './pages/edit-task/edit-task.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent  },
  { path: 'new-tasks', component: NewTasksComponent },
  { path: 'edit-tasks/:tasksId', component: EditTasksComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'tasks', component: TaskViewComponent },
  { path: 'tasks/:tasksId', component: TaskViewComponent },
  { path: 'tasks/:tasksId/new-task', component: NewTaskComponent },
  { path: 'tasks/:tasksId/edit-task/:taskId', component: EditTaskComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
