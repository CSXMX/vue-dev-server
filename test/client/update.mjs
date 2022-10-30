export async function update(path) {
    try {
        location.reload();
        // const res = await import('/test.vue');
        // console.log('vue:', res);
    } catch (err) {
        throw new Error(err);
    }
}