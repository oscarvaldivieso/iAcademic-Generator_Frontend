export const GlobalComponent = {
    // Api Calling
    // API_URL: 'https://api-node.themesbrand.website/',
    API_URL: '/api/',  // Usando el proxy
    headerToken: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },

    // Auth Api
    // AUTH_API: "https://api-node.themesbrand.website/auth/",
    AUTH_API: "/api/auth/",  // Usando el proxy

    // Products Api
    product: 'apps/product',
    productDelete: 'apps/product/',

    // Orders Api
    order: 'apps/order',
    orderId: 'apps/order/',

    // Customers Api
    customer: 'apps/customer',
}