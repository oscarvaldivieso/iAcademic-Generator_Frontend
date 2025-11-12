import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
    {
        id: 124,
        label: 'MENUITEMS.DASHBOARD.TEXT',
        icon: "ph-gauge",
        link: '/'
    },
    {
        id: 30,
        label: 'MENUITEMS.USERS.TEXT',
        icon: 'ph-identification-badge',
        parentId: 8,
        subItems: [
            {
                id: 31,
                label: 'MENUITEMS.USERS.LIST.USERS',
                link: 'aca/users/list',
                parentId: 30
            },
            {
                id: 32,
                label: 'MENUITEMS.USERS.LIST.ROLES',
                link: 'aca/roles/list',
                parentId: 30
            },
        ]
    },
    {
        id: 40,
        label: 'MENUITEMS.CATALOG.TEXT',
        icon: 'ph-student',
        parentId: 8,
        subItems: [
            {
                id: 41,
                label: 'MENUITEMS.CATALOG.LIST.CAMPUS',
                link: '/uni/campus/list',
                parentId: 40
            },
            {
                id: 42,
                label: 'MENUITEMS.CATALOG.LIST.CAREERS',
                link: '/uni/careers/list',
                parentId: 40
            },
            {
                id: 43,
                label: 'MENUITEMS.CATALOG.LIST.SUBJECTS',
                link: '/aca/subjects/list',
                parentId: 40
            },
            {
                id: 44,
                label: 'MENUITEMS.CATALOG.LIST.MODALITIES',
                link: '/uni/modalities/list',
                parentId: 40
            },
            {
                id: 45,
                label: 'MENUITEMS.CATALOG.LIST.PERIODS',
                link: '/uni/periods/list',
                parentId: 40
            },
            {
                id: 46,
                label: 'MENUITEMS.CATALOG.LIST.SECTIONS',
                link: '/uni/sections/list',
                parentId: 40
            },
            {
                id: 47,
                label: 'MENUITEMS.CATALOG.LIST.CLASSROOMS',
                link: '/uni/classrooms/list',
                parentId: 40
            },
            {
                id: 48,
                label: 'MENUITEMS.CATALOG.LIST.AREAS',
                link: '/aca/areas/list',
                parentId: 40
            }
        ]
    },
    {
        id: 20,
        label: 'MENUITEMS.PEOPLE.TEXT',
        icon: 'ph-users-three',
        parentId: 8,
        subItems: [
            {
                id: 21,
                label: 'MENUITEMS.PEOPLE.LIST.STUDENTS',
                link: '/exp/students/list',
                parentId: 20
            },
            {
                id: 22,
                label: 'MENUITEMS.PEOPLE.LIST.TEACHERS',
                link: '/aca/teachers/list',
                parentId: 20
            },
            {
                id: 23,
                label: 'MENUITEMS.PEOPLE.LIST.CONTACTS',
                link: '/exp/contacts/list',
                parentId: 20
            }
        ]
    },
    {
        id: 124,
        label: 'MENUITEMS.OFFER.LABEL',
        icon: "ph-student",
        link: '/exp/pre-enrollment'
    },
    
]