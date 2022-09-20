export const getRandomId = () => {
    return `${Math.random(1, 10).toString().substring(0, 5)}-${new Date().getTime()}-${Math.random(1, 10).toString().substring(0, 5)}`
}