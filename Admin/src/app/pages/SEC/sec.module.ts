import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { SecRoutingModule } from './sec-routing.module';
import { ListComponent } from './Users/list/list.component';
import { CreateComponent } from './Users/create/create.component';
import { EditComponent } from './Users/edit/edit.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PaginationModule,
    SecRoutingModule,
    // Import standalone components
    ListComponent,
    CreateComponent,
    EditComponent
  ]
})

export class SecModule { }