import { getRandomId } from '../utils/utils'

let randomId = getRandomId()

export const refreshRandomId = () => {
    randomId = getRandomId()

    return randomId
}

console.log(randomId);