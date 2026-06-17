import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./componentes/login/login').then(m => m.Login)
    },
    {
        path: 'mi-perfil',
        loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil),
        canActivate: [authGuard]

    },
    {
        path: 'publicaciones',
        loadComponent: () => import('./componentes/publicaciones/publicaciones').then(m => m.Publicaciones),
        canActivate: [authGuard]
    },
    {
        path:'registro',
        loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro)
    },
    {
        path:'perfil/:id',
        loadComponent: () => import('./componentes/perfil-usuario/perfil-usuario').then(m => m.PerfilUsuario),
        canActivate: [authGuard]
    },

    {
        path:'**',
        redirectTo: 'login'
    }
];
