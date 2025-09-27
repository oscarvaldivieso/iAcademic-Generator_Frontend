import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
    
    {
        id: 8,
        label: 'MENUITEMS.APPS.TEXT',
        isTitle: true
    },
    {
        id: 7,
        label: 'MENUITEMS.WEBSITE.LIST.INICIO',
        icon: 'ph-house',
        link: '/website/home',
        parentId: 8
    },
    {
        id: 9,
        label: 'MENUITEMS.WEBSITE.LIST.REQUEST',
        icon: 'ph-request',
        link: '/website/request',
        parentId: 8
    },
    {
        id: 10,
        label: 'MENUITEMS.APPS.LIST.HOTELES',
        icon: 'ph-chats',
        link: '/website/hoteles',
        parentId: 8
    },
    {
        id: 11,
        label: 'MENUITEMS.APPS.LIST.VUELOS',
        icon: 'ph-envelope',
        link: '/website/vuelos',
        parentId: 8,
    },
    {
        id: 12,
        label: 'MENUITEMS.APPS.LIST.PAQUETES',
        icon: 'ph-envelope',
        link: '/website/paquetes/list',
        parentId: 8,
    }
    
    
    
]