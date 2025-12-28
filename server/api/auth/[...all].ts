export default defineEventHandler((event) => {
    return auth.handler(event);
});
