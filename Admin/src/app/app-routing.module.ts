import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import { LayoutComponent } from './layouts/layout.component';
import { AuthlayoutComponent } from './authlayout/authlayout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { 
    path: 'website', 
    loadChildren: () => import('./website/website.module').then(m => m.WebsiteModule),
    data: { public: true }
  },
  { 
    path: 'auth', 
    component: AuthlayoutComponent, 
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    data: { public: true }
  },
  { 
    path: 'pages', 
    component: AuthlayoutComponent, 
    loadChildren: () => import('./extraspages/extraspages.module').then(m => m.ExtraspagesModule)
  },
  { 
    path: '', 
    component: LayoutComponent, 
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), 
    canActivate: [AuthGuard] 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
